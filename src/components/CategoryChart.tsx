"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
} from "recharts";
import type { PieSectorShapeProps } from "recharts";
import { CATEGORY_COLORS } from "@/lib/expenses/chart-colors";
import { formatYen } from "@/lib/expenses/format";
import type {
  CategoryMonthlyComparison,
  CategoryTotal,
} from "@/lib/expenses/summary";
import type { ExpenseCategory } from "@/types/expense";

type CategoryChartProps = {
  data: CategoryTotal[];
  comparisons: CategoryMonthlyComparison[];
  title?: string;
};

const MOVE_OFFSET = 7;
const HOVER_SCALE = 1.034;
const FLOAT_TRANSITION = "2.2s var(--mm-ease-float)";
const CHART_HEIGHT = 520;
const INNER_RADIUS = 98;
const OUTER_RADIUS = 188;
/** 12時方向から時計回り */
const PIE_START_ANGLE = 90;
const PIE_END_ANGLE = -270;
const TOOLTIP_OFFSET = 12;

function sortByAmountDesc(data: CategoryTotal[]): CategoryTotal[] {
  return [...data].sort((a, b) => b.amount - a.amount);
}

function getComparisonTone(
  comparison: CategoryMonthlyComparison,
): "neutral" | "increase" | "decrease" {
  if (comparison.difference > 0) return "increase";
  if (comparison.difference < 0) return "decrease";
  return "neutral";
}

function toneClass(tone: "neutral" | "increase" | "decrease"): string {
  if (tone === "increase") return "text-[#c94444]";
  if (tone === "decrease") return "text-[var(--mf-primary-dark)]";
  return "text-[var(--mf-text)]";
}

function CategoryMonthOverMonth({
  comparison,
}: {
  comparison: CategoryMonthlyComparison;
}) {
  const { previousAmount, currentAmount, difference, changePercent } =
    comparison;

  if (previousAmount === 0 && currentAmount === 0) {
    return <p style={{ color: "var(--mf-text)" }}>前月比: 比較データなし</p>;
  }

  if (previousAmount === 0) {
    return <p style={{ color: "var(--mf-text)" }}>前月比: 前月は支出なし</p>;
  }

  const tone = getComparisonTone(comparison);
  const isIncrease = difference > 0;

  return (
    <p className={toneClass(tone)}>
      前月比: {isIncrease ? "+" : ""}
      {formatYen(difference)}
      {changePercent !== null && (
        <span className="ml-1">
          ({isIncrease ? "+" : ""}
          {changePercent}%)
        </span>
      )}
    </p>
  );
}

function renderSector(
  props: PieSectorShapeProps,
  hoveredIndex: number | undefined,
) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    index,
    payload,
  } = props;

  const category = (payload as CategoryTotal | undefined)?.category;
  const fill = category ? CATEGORY_COLORS[category] : props.fill;
  const isHovered = hoveredIndex === index;

  const midAngleRad = (((startAngle + endAngle) / 2) * Math.PI) / 180;
  const translateX = isHovered ? MOVE_OFFSET * Math.cos(-midAngleRad) : 0;
  const translateY = isHovered ? MOVE_OFFSET * Math.sin(-midAngleRad) : 0;

  return (
    <g
      style={{
        transform: `translate(${translateX}px, ${translateY}px) scale(${isHovered ? HOVER_SCALE : 1})`,
        transformBox: "fill-box",
        transformOrigin: "center",
        transition: `transform ${FLOAT_TRANSITION}`,
        filter: isHovered
          ? "drop-shadow(0 10px 20px rgba(21, 32, 43, 0.14))"
          : "none",
      }}
    >
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        fillOpacity={1}
        stroke="none"
        strokeWidth={0}
      />
    </g>
  );
}

type ChartLegendProps = {
  data: CategoryTotal[];
  hoveredIndex: number | undefined;
  onHover: (index: number | undefined, source: "pie" | "legend") => void;
};

function ChartLegend({ data, hoveredIndex, onHover }: ChartLegendProps) {
  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2.5">
      {data.map((entry, index) => {
        const color = CATEGORY_COLORS[entry.category as ExpenseCategory];
        const isHovered = hoveredIndex === index;

        return (
          <li key={entry.category}>
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium"
              style={{
                color: "var(--mf-text-strong)",
                fontWeight: isHovered ? 700 : 500,
                transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                transition: "transform 1.75s var(--mm-ease-float)",
              }}
              onMouseEnter={() => onHover(index, "legend")}
              onMouseLeave={() => onHover(undefined, "legend")}
              onFocus={() => onHover(index, "legend")}
              onBlur={() => onHover(undefined, "legend")}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              {entry.category}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CategoryHoverDetail({
  item,
  comparison,
}: {
  item: CategoryTotal;
  comparison: CategoryMonthlyComparison | undefined;
}) {
  return (
    <div
      className="pointer-events-none px-4 py-2.5 text-sm shadow-md"
      style={{
        borderRadius: "var(--mf-radius-md)",
        backgroundColor: "var(--mf-surface)",
      }}
      aria-live="polite"
    >
      <p className="font-semibold" style={{ color: "var(--mf-text-strong)" }}>
        {item.category}
      </p>
      <p
        className="mt-0.5 font-bold"
        style={{ color: "var(--mf-text-strong)" }}
      >
        {formatYen(item.amount)}
      </p>
      {comparison && (
        <div className="mt-1 text-xs">
          <CategoryMonthOverMonth comparison={comparison} />
        </div>
      )}
    </div>
  );
}

export function CategoryChart({
  data,
  comparisons,
  title = "カテゴリ別支出",
}: CategoryChartProps) {
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const hoverRef = useRef<{
    index: number | undefined;
    source: "pie" | "legend" | null;
  }>({ index: undefined, source: null });
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(
    undefined,
  );
  const [tooltipSource, setTooltipSource] = useState<"pie" | "legend" | null>(
    null,
  );

  const comparisonMap = useMemo(
    () => new Map(comparisons.map((item) => [item.category, item])),
    [comparisons],
  );

  const sortedData = useMemo(() => sortByAmountDesc(data), [data]);

  const hoveredItem =
    hoveredIndex !== undefined ? sortedData[hoveredIndex] : undefined;
  const hoveredComparison = hoveredItem
    ? comparisonMap.get(hoveredItem.category)
    : undefined;

  const placeTooltip = useCallback(
    (x: number, y: number, centered: boolean) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) {
        return;
      }

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.transform = centered ? "translate(-50%, -50%)" : "none";
    },
    [],
  );

  const syncTooltipPosition = useCallback(() => {
    if (!chartAreaRef.current || hoveredIndex === undefined) {
      return;
    }

    if (tooltipSource === "legend") {
      const { width, height } = chartAreaRef.current.getBoundingClientRect();
      placeTooltip(width / 2, height * 0.46, true);
      return;
    }

    placeTooltip(
      lastMousePos.current.x + TOOLTIP_OFFSET,
      lastMousePos.current.y + TOOLTIP_OFFSET,
      false,
    );
  }, [hoveredIndex, placeTooltip, tooltipSource]);

  useEffect(() => {
    syncTooltipPosition();
  }, [syncTooltipPosition]);

  const handleChartMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!chartAreaRef.current) {
      return;
    }

    const rect = chartAreaRef.current.getBoundingClientRect();
    lastMousePos.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    if (tooltipSource === "pie" && hoveredIndex !== undefined) {
      placeTooltip(
        lastMousePos.current.x + TOOLTIP_OFFSET,
        lastMousePos.current.y + TOOLTIP_OFFSET,
        false,
      );
    }
  };

  const handleHover = useCallback(
    (index: number | undefined, source: "pie" | "legend") => {
      const current = hoverRef.current;
      if (
        index === current.index &&
        (index === undefined || current.source === source)
      ) {
        return;
      }

      hoverRef.current = {
        index,
        source: index === undefined ? null : source,
      };
      setHoveredIndex(index);
      setTooltipSource(index === undefined ? null : source);
    },
    [],
  );

  const pieShape = useCallback(
    (props: PieSectorShapeProps) => renderSector(props, hoveredIndex),
    [hoveredIndex],
  );

  const handlePieMouseEnter = useCallback(
    (_: unknown, index: number) => {
      handleHover(index, "pie");
    },
    [handleHover],
  );

  return (
    <div className="mm-section">
      <h2 className="mm-section-title">{title}</h2>

      {data.length === 0 ? (
        <p className="py-8 text-sm" style={{ color: "var(--mf-text)" }}>
          今月の支出データがありません。
        </p>
      ) : (
        <div
          className="mx-auto w-full max-w-2xl"
          onMouseLeave={() => handleHover(undefined, "pie")}
        >
          <div
            ref={chartAreaRef}
            className="relative"
            onMouseMove={handleChartMouseMove}
          >
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <PieChart>
                <Pie
                  data={sortedData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={INNER_RADIUS}
                  outerRadius={OUTER_RADIUS}
                  startAngle={PIE_START_ANGLE}
                  endAngle={PIE_END_ANGLE}
                  paddingAngle={2}
                  isAnimationActive
                  animationDuration={1400}
                  animationEasing="ease-in-out"
                  shape={pieShape}
                  onMouseEnter={handlePieMouseEnter}
                />
              </PieChart>
            </ResponsiveContainer>

            {hoveredItem && (
              <div
                ref={tooltipRef}
                className="pointer-events-none absolute z-20"
                style={{ transition: "none" }}
              >
                <CategoryHoverDetail
                  item={hoveredItem}
                  comparison={hoveredComparison}
                />
              </div>
            )}
          </div>

          <ChartLegend
            data={sortedData}
            hoveredIndex={hoveredIndex}
            onHover={handleHover}
          />
        </div>
      )}
    </div>
  );
}
