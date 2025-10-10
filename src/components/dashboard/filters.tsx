
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { policeStations, crimeTypes } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { NeonCheckbox } from "@/components/ui/neon-checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type FiltersProps = {
  dateRange?: DateRange
  setDateRange: (dateRange?: DateRange) => void
  selectedStation: string
  setSelectedStation: (station: string) => void
  selectedCrimeTypes: string[]
  setSelectedCrimeTypes: (crimeTypes: string[]) => void
}

const crimeColorMap: { [key: string]: string } = {
  Theft: "hsl(var(--chart-5))",
  Accident: "hsl(var(--chart-2))",
  Harassment: "hsl(var(--destructive))",
};


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
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const value = e.target.value;
    if (!value) {
      setDateRange({
        ...dateRange,
        [field]: undefined
      });
      return;
    }

    try {
      const newDate = parseISO(value);
      setDateRange({
        ...dateRange,
        [field]: newDate,
      });
    } catch (error) {
      console.error("Invalid date format", error);
    }
  };


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-2">
            <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                    id="start-date"
                    type="date"
                    value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleDateChange(e, 'from')}
                    className="mt-1"
                />
            </div>
             <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                    id="end-date"
                    type="date"
                    value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleDateChange(e, 'to')}
                    className="mt-1"
                />
            </div>
        </div>

        <div>
          <Label>Police Station</Label>
          <Popover open={stationPopoverOpen} onOpenChange={setStationPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={stationPopoverOpen}
                className="w-full justify-between mt-1"
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
      </div>

      <div>
        <Label>Crime Types</Label>
        <div className="flex flex-wrap items-center gap-6 p-3 rounded-md border mt-1 h-auto min-h-10">
          {crimeTypes.map(crimeType => (
            <div key={crimeType.value} className="flex items-center space-x-2">
              <NeonCheckbox
                id={crimeType.value}
                checked={selectedCrimeTypes.includes(crimeType.value)}
                onCheckedChange={(isChecked) => handleCrimeTypeChange(crimeType.value, Boolean(isChecked))}
                color={crimeColorMap[crimeType.value]}
              />
              <Label htmlFor={crimeType.value} className="font-normal cursor-pointer">
                {crimeType.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
