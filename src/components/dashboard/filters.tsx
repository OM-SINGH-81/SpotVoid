"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { policeStations, crimeTypes } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { NeonCheckbox } from "@/components/ui/neon-checkbox"

type FiltersProps = {
  dateRange?: DateRange
  setDateRange: (dateRange?: DateRange) => void
  selectedStation: string
  setSelectedStation: (station: string) => void
  selectedCrimeTypes: string[]
  setSelectedCrimeTypes: (crimeTypes: string[]) => void
}

export default function Filters({
  dateRange,
  setDateRange,
  selectedStation,
  setSelectedStation,
  selectedCrimeTypes,
  setSelectedCrimeTypes,
}: FiltersProps) {
  const [stationPopoverOpen, setStationPopoverOpen] = React.useState(false)

  const handleCrimeTypeChange = (crimeType: string, isChecked: boolean) => {
    setSelectedCrimeTypes(
      isChecked
        ? [...selectedCrimeTypes, crimeType]
        : selectedCrimeTypes.filter(ct => ct !== crimeType)
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
      <div>
        <Label>Date range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Police Station</Label>
        <Popover open={stationPopoverOpen} onOpenChange={setStationPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={stationPopoverOpen}
              className="w-full justify-between"
            >
              {selectedStation
                ? policeStations.find(station => station.value === selectedStation)?.label
                : "Select station..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search station..." />
              <CommandList>
                <CommandEmpty>No station found.</CommandEmpty>
                <CommandGroup>
                  {policeStations.map(station => (
                    <CommandItem
                      key={station.value}
                      value={station.value}
                      onSelect={currentValue => {
                        setSelectedStation(currentValue)
                        setStationPopoverOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedStation === station.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {station.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Crime Types</Label>
        <div className="flex items-center space-x-6 p-2.5 rounded-md border h-10">
          {crimeTypes.map(crimeType => (
            <div key={crimeType.value} className="flex items-center space-x-2">
              <NeonCheckbox
                id={crimeType.value}
                checked={selectedCrimeTypes.includes(crimeType.value)}
                onCheckedChange={(isChecked) => handleCrimeTypeChange(crimeType.value, isChecked)}
              />
              <Label htmlFor={crimeType.value} className="font-normal">
                {crimeType.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
