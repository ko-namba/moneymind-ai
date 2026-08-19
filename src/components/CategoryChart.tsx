"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
} from "recharts";
import type { PieSectorShapeProps } from "recharts";
import { CategoryBreakdownModal } from "@/components/CategoryBreakdownModal";
import { CATEGORY_COLORS } from "@/lib/expenses/chart-colors";
import { formatYen } from "@/lib/expenses/format";
import type {
  CategoryMonthlyComparison,
  CategoryTotal,
} from "@/lib/expenses/summary";
import type { Expense, ExpenseCategory } from "@/types/expense";

type CategoryChartProps = {
  data: CategoryTotal[];
  comparisons: CategoryMonthlyComparison[];
  /** カテゴリ内訳の表示に使う当月の支出明細 */
  expenses?: Expense[];
  title?: string;
  /** 見出しに追加するクラス（サイズ調整などに利用） */
  titleClassName?: string;
  emptyMessage?: string;
};

const MOVE_OFFSET = 7;
const HOVER_SCALE = 1.034;
const FLOAT_TRANSITION = "2.2s var(--mm-ease-float)";
/** PC表示時のグラフ寸法 */
const DESKTOP_CHART_HEIGHT = 520;
const DESKTOP_INNER_RADIUS = 98;
const DESKTOP_OUTER_RADIUS = 188;
/** スマホ表示時のグラフ寸法（画面に収まるよう小さめにする） */
const MOBILE_CHART_HEIGHT = 300;
const MOBILE_INNER_RADIUS = 60;
const MOBILE_OUTER_RADIUS = 112;
/** PCレイアウトに切り替えるブレークポイント（Tailwind の lg と揃える） */
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
/** 12時方向から時計回り */
const PIE_START_ANGLE = 90;
const PIE_END_ANGLE = -270;
const TOOLTIP_OFFSET = 12;

/** 現在の画面幅がPC相当かどうかを返す。リサイズにも追従する。 */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

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
  if (tone === "increase") return "text-[#cd4458]";
  if (tone === "decrease") return "text-[#2f7fb5]";
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
        <span className="block">
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
  onSelect: (category: ExpenseCategory) => void;
};

function ChartLegend({ data, hoveredIndex, onHover, onSelect }: ChartLegendProps) {
  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2.5">
      {data.map((entry, index) => {
        const color = CATEGORY_COLORS[entry.category as ExpenseCategory];
        const isHovered = hoveredIndex === index;

        return (
          <li key={entry.category}>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 text-sm font-medium"
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
              onClick={() => onSelect(entry.category)}
              aria-label={`${entry.category} の内訳を見る`}
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

type CategoryDetailCardProps = {
  item: CategoryTotal;
  index: number;
  comparison: CategoryMonthlyComparison | undefined;
  hoveredIndex: number | undefined;
  onHover: (index: number | undefined, source: "pie" | "legend") => void;
  onSelect: (category: ExpenseCategory) => void;
  side: "left" | "right";
};

/** PC表示でグラフの左右に並べる、カテゴリごとの詳細カード */
function CategoryDetailCard({
  item,
  index,
  comparison,
  hoveredIndex,
  onHover,
  onSelect,
  side,
}: CategoryDetailCardProps) {
  const color = CATEGORY_COLORS[item.category as ExpenseCategory];
  const isHovered = hoveredIndex === index;
  const alignText = side === "left" ? "text-right" : "text-left";
  const alignRow = side === "left" ? "justify-end" : "justify-start";

  return (
    <button
      type="button"
      className="w-full cursor-pointer px-3.5 py-2.5"
      style={{
        borderRadius: "var(--mf-radius-md)",
        backgroundColor: isHovered
          ? "var(--mf-primary-subtle)"
          : "transparent",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition:
          "transform 1.75s var(--mm-ease-float), background-color 0.4s var(--mm-ease-smooth)",
      }}
      onMouseEnter={() => onHover(index, "legend")}
      onMouseLeave={() => onHover(undefined, "legend")}
      onFocus={() => onHover(index, "legend")}
      onBlur={() => onHover(undefined, "legend")}
      onClick={() => onSelect(item.category)}
      aria-label={`${item.category} の内訳を見る`}
    >
      <div className={`flex items-center gap-2 ${alignRow}`}>
        {side === "right" && (
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        )}
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--mf-text-strong)" }}
        >
          {item.category}
        </span>
        {side === "left" && (
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        )}
      </div>
      <p
        className={`mt-1 text-sm font-bold ${alignText}`}
        style={{ color: "var(--mf-text-strong)" }}
      >
        {formatYen(item.amount)}
      </p>
      {comparison && (
        <div className={`mt-0.5 text-xs ${alignText}`}>
          <CategoryMonthOverMonth comparison={comparison} />
        </div>
      )}
    </button>
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
      className="pointer-events-none flex w-max flex-col justify-center whitespace-nowrap px-4 py-2.5 text-sm shadow-md"
      style={{
        borderRadius: "var(--mf-radius-md)",
        backgroundColor: "var(--mf-surface)",
      }}
      aria-live="polite"
    >
      <p
        className="font-semibold"
        style={{ color: "var(--mf-text-strong)" }}
      >
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
  expenses = [],
  title = "カテゴリ別支出",
  titleClassName = "",
  emptyMessage = "支出データがありません。",
}: CategoryChartProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
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

  const isDesktop = useIsDesktop();
  const chartHeight = isDesktop ? DESKTOP_CHART_HEIGHT : MOBILE_CHART_HEIGHT;
  const innerRadius = isDesktop ? DESKTOP_INNER_RADIUS : MOBILE_INNER_RADIUS;
  const outerRadius = isDesktop ? DESKTOP_OUTER_RADIUS : MOBILE_OUTER_RADIUS;

  const comparisonMap = useMemo(
    () => new Map(comparisons.map((item) => [item.category, item])),
    [comparisons],
  );

  const sortedData = useMemo(() => sortByAmountDesc(data), [data]);

  // カテゴリごとに支出明細をまとめる（内訳モーダル表示に使う）
  const expensesByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, Expense[]>();
    for (const expense of expenses) {
      const list = map.get(expense.category);
      if (list) {
        list.push(expense);
      } else {
        map.set(expense.category, [expense]);
      }
    }
    return map;
  }, [expenses]);

  const selectedItems = selectedCategory
    ? (expensesByCategory.get(selectedCategory) ?? [])
    : [];
  const selectedTotal = selectedItems.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  // 左右の列に交互に振り分ける（金額が大きい順に左→右→左…）
  const { leftItems, rightItems } = useMemo(() => {
    const left: { item: CategoryTotal; index: number }[] = [];
    const right: { item: CategoryTotal; index: number }[] = [];
    sortedData.forEach((item, index) => {
      (index % 2 === 0 ? left : right).push({ item, index });
    });
    return { leftItems: left, rightItems: right };
  }, [sortedData]);

  const hoveredItem =
    hoveredIndex !== undefined ? sortedData[hoveredIndex] : undefined;
  const hoveredComparison = hoveredItem
    ? comparisonMap.get(hoveredItem.category)
    : undefined;

  const placeTooltip = useCallback(
    (x: number, y: number, centered: boolean) => {
      const tooltip = tooltipRef.current;
      const area = chartAreaRef.current;
      if (!tooltip || !area) {
        return;
      }

      if (centered) {
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.transform = "translate(-50%, -50%)";
        return;
      }

      // ツールチップがグラフ領域からはみ出さないよう位置を収める
      const margin = 4;
      const maxLeft = area.clientWidth - tooltip.offsetWidth - margin;
      const maxTop = area.clientHeight - tooltip.offsetHeight - margin;
      const clampedX = Math.max(margin, Math.min(x, maxLeft));
      const clampedY = Math.max(margin, Math.min(y, maxTop));

      tooltip.style.left = `${clampedX}px`;
      tooltip.style.top = `${clampedY}px`;
      tooltip.style.transform = "none";
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

  const handleSelect = useCallback((category: ExpenseCategory) => {
    setSelectedCategory(category);
  }, []);

  const handlePieClick = useCallback(
    (_: unknown, index: number) => {
      const item = sortedData[index];
      if (item) {
        handleSelect(item.category);
      }
    },
    [handleSelect, sortedData],
  );

  return (
    <div className="mm-section">
      <h2 className={`mm-section-title ${titleClassName}`}>{title}</h2>

      {data.length === 0 ? (
        <p className="py-8 text-sm" style={{ color: "var(--mf-text)" }}>
          {emptyMessage}
        </p>
      ) : (
        <div
          className="mx-auto w-full max-w-2xl lg:max-w-5xl"
          onMouseLeave={() => handleHover(undefined, "pie")}
        >
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_440px_minmax(0,1fr)] lg:items-center lg:gap-x-4">
            {/* PC表示: グラフ左側のカテゴリ詳細 */}
            <div className="hidden lg:flex lg:flex-col lg:gap-1.5">
              {leftItems.map(({ item, index }) => (
                <CategoryDetailCard
                  key={item.category}
                  item={item}
                  index={index}
                  comparison={comparisonMap.get(item.category)}
                  hoveredIndex={hoveredIndex}
                  onHover={handleHover}
                  onSelect={handleSelect}
                  side="left"
                />
              ))}
            </div>

            <div
              ref={chartAreaRef}
              className="relative"
              onMouseMove={handleChartMouseMove}
            >
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={sortedData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={PIE_START_ANGLE}
                    endAngle={PIE_END_ANGLE}
                    paddingAngle={2}
                    isAnimationActive
                    animationDuration={1400}
                    animationEasing="ease-in-out"
                    shape={pieShape}
                    onMouseEnter={handlePieMouseEnter}
                    onClick={handlePieClick}
                    style={{ cursor: "pointer" }}
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

            {/* PC表示: グラフ右側のカテゴリ詳細 */}
            <div className="hidden lg:flex lg:flex-col lg:gap-1.5">
              {rightItems.map(({ item, index }) => (
                <CategoryDetailCard
                  key={item.category}
                  item={item}
                  index={index}
                  comparison={comparisonMap.get(item.category)}
                  hoveredIndex={hoveredIndex}
                  onHover={handleHover}
                  onSelect={handleSelect}
                  side="right"
                />
              ))}
            </div>
          </div>

          {/* スマホ表示: グラフ下の凡例 */}
          <div className="lg:hidden">
            <ChartLegend
              data={sortedData}
              hoveredIndex={hoveredIndex}
              onHover={handleHover}
              onSelect={handleSelect}
            />
          </div>
        </div>
      )}

      {selectedCategory && (
        <CategoryBreakdownModal
          category={selectedCategory}
          items={selectedItems}
          total={selectedTotal}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
