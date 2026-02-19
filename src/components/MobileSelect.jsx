import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

function useIsMobile() {
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768
  );
  return isMobile;
}

export default function MobileSelect({ value, onValueChange, placeholder, label, options, triggerClassName }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ${triggerClassName || ""}`}
      >
        <span className="line-clamp-1">{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{label || placeholder || "Select"}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-1 max-h-[50vh] overflow-y-auto">
            {options.map((opt) => (
              <DrawerClose key={opt.value} asChild>
                <button
                  type="button"
                  onClick={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors ${
                    value === opt.value
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="w-5 h-5 text-purple-600" />}
                </button>
              </DrawerClose>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}