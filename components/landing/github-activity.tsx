"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { githubSectionConfig as copy } from "@/config/github";
import { activityColor, type ActivityCalendar } from "@/lib/github/github-activity";
import { cn } from "@/lib/utils";
import { MOTION_EASE } from "@/lib/motion";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const monthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "UTC",
});

function dayLabel(day: ActivityCalendar["days"][number]) {
  const count =
    day.count === null
      ? copy.unavailable
      : `${day.count} ${day.count === 1 ? copy.contribution : copy.contributions}`;
  return { date: dateFormat.format(new Date(`${day.date}T00:00:00Z`)), count };
}

const calendarVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: MOTION_EASE },
  },
};

// Календарь рендерится статично (без скролла). Первая неделя (индекс 0) и
// последняя неделя (weekCount - 1) не попадают в блок по ширине и пропускаются.
// actualColumn = column + 1 смещает индекс, чтобы не рендерить неделю 0.
// weekCount - 2 вместо weekCount - 1 убирает лишнюю неделю справа.
export function GitHubActivity({ calendar }: { calendar: ActivityCalendar }) {
  const [selectedIndex, setSelectedIndex] = useState(calendar.lastIndex);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const hintId = useId();

  function selectDay(index: number, focus = false) {
    if (index < calendar.firstIndex || index > calendar.lastIndex) return;
    setSelectedIndex(index);
    const button = buttons.current.get(index);
    if (focus) button?.focus({ preventScroll: true });
  }

  function onDayKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const row = index % 7;
    const rowStart = row < calendar.firstIndex ? row + 7 : row;
    const rowEnd = calendar.lastIndex - ((calendar.lastIndex - row) % 7);
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = index - 7;
        break;
      case "ArrowRight":
        next = index + 7;
        break;
      case "ArrowUp":
        next = row > 0 ? index - 1 : index;
        break;
      case "ArrowDown":
        next = row < 6 ? index + 1 : index;
        break;
      case "Home":
        next = event.ctrlKey ? calendar.firstIndex : rowStart;
        break;
      case "End":
        next = event.ctrlKey ? calendar.lastIndex : rowEnd;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectDay(next, true);
  }

  return (
    <motion.div variants={calendarVariants} initial="hidden" animate="visible">
      <div>
        <p id={hintId} className="sr-only">
          {copy.keyboardHint}
        </p>
        <div
          className="no-scrollbar overflow-x-hidden overflow-y-hidden pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="w-full px-0.5">
            <div
              className="relative mb-2 h-4 font-mono text-[10px] text-muted-foreground"
              aria-hidden="true"
            >
              {calendar.months
                .filter(({ column }) => column >= 1 && column < calendar.weekCount)
                .map(({ date, column }) => (
                  <span
                    key={date}
                    className="absolute"
                    style={{ left: (column - 1) * 13 }}
                  >
                    {monthFormat.format(new Date(`${date}T00:00:00Z`))}
                  </span>
                ))}
            </div>
            <div
              role="grid"
              aria-label={copy.calendarLabel}
              aria-describedby={hintId}
            >
              {copy.weekdays.map((weekday, row) => (
                <div
                  key={weekday}
                  role="row"
                  aria-label={weekday}
                  className="flex"
                >
                  {Array.from({ length: calendar.weekCount - 1 }, (_, column) => {
                    const actualColumn = column + 1;
                    const index = actualColumn * 7 + row;
                    const day = calendar.days[index];
                    const label = dayLabel(day);
                    return (
                      <div
                        key={day.date}
                        role="gridcell"
                        className="size-[13px] shrink-0"
                      >
                        <Tooltip
                          open={tooltipIndex === index}
                          onOpenChange={(open) =>
                            setTooltipIndex((current) =>
                              open ? index : current === index ? null : current,
                            )
                          }
                        >
                          <TooltipTrigger asChild>
                            <button
                              ref={(node) => {
                                if (node) buttons.current.set(index, node);
                                else buttons.current.delete(index);
                              }}
                              type="button"
                              tabIndex={index === selectedIndex ? 0 : -1}
                              aria-label={`${label.date}: ${label.count}`}
                              data-date={day.date}
                              data-count={day.count ?? "missing"}
                              className="group flex size-full cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                              onFocus={() => setSelectedIndex(index)}
                              onClick={(event) => {
                                // Keep details available on touch, where hover is absent.
                                event.preventDefault();
                                selectDay(index);
                                setTooltipIndex(index);
                              }}
                              onKeyDown={(event) => onDayKeyDown(event, index)}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "size-[9px] rounded-full group-hover:outline group-hover:outline-1 group-hover:outline-offset-1 group-hover:outline-muted-foreground",
                                  day.count === null && day.status === "past"
                                    ? "bg-border"
                                    : day.count === null
                                      ? "ring-1 ring-inset ring-border"
                                      : undefined,
                                )}
                                style={
                                  day.count === null
                                    ? undefined
                                    : {
                                        backgroundColor: activityColor(
                                          day.count,
                                        ),
                                      }
                                }
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={4}>
                            <p>
                              {label.date}: {label.count}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[10px] text-muted-foreground"
          aria-label={copy.legend}
        >
          <span>{copy.less}</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ backgroundColor: activityColor(level) }}
            />
          ))}
          <span>{copy.more}</span>
        </div>
      </div>
    </motion.div>
  );
}
