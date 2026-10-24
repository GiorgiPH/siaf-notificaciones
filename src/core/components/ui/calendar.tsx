"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/core/lib/utils/cn"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "relative flex flex-row gap-6",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center items-center h-9",
        caption_label: "text-sm font-normal text-content-high capitalize",
        nav: "absolute left-0 right-0 top-0 h-9 flex items-center justify-between pointer-events-none",
        button_previous: cn(
          "pointer-events-auto inline-flex items-center justify-center size-9 rounded-xl border border-border-low bg-bg-base text-content-low hover:bg-bg-surface-low hover:text-content-high transition-colors",
        ),
        button_next: cn(
          "pointer-events-auto inline-flex items-center justify-center size-9 rounded-xl border border-border-low bg-bg-base text-content-low hover:bg-bg-surface-low hover:text-content-high transition-colors",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-1",
        weekday: "flex-1 text-center text-xs font-light text-content-low py-1",
        week: "flex w-full",
        day: "flex-1 flex items-center justify-center p-0 text-center",
        day_button: cn(
          "w-9 h-9 flex items-center justify-center rounded-md text-sm font-light text-content-high",
          "hover:bg-bg-surface-md transition-colors outline-none",
          "focus-visible:ring-2 focus-visible:ring-support-focus",
        ),
        selected:
          "[&>button]:bg-accent-primary [&>button]:text-accent-on-primary [&>button]:hover:opacity-90",
        range_start: "[&>button]:!bg-accent-primary [&>button]:!text-accent-on-primary [&>button]:rounded-md",
        range_end: "[&>button]:!bg-accent-primary [&>button]:!text-accent-on-primary [&>button]:rounded-md",
        range_middle: "[&>button]:!bg-bg-surface-low [&>button]:!text-content-high [&>button]:rounded-md",
        today: "[&>button]:border [&>button]:border-border-md",
        outside: "opacity-30",
        disabled: "opacity-30 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClass, ...iconProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className={cn("size-4", iconClass)} {...iconProps} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
