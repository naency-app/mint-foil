import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";

export interface TcgCardProps {
  name: string;
  price: string;
  imageUrl: string;
  setCode: string;
  change: number;
}

export function TcgCard({
  name,
  price,
  imageUrl,
  setCode,
  change,
}: TcgCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="group w-full overflow-hidden bg-slate-900/50 border-slate-800 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1">
      <CardContent className="p-0 relative">
        <Badge className="absolute top-2 right-2 z-10 bg-blue-600/90 hover:bg-blue-700 backdrop-blur-sm text-[10px] font-mono tracking-wider">
          {setCode}
        </Badge>
        <div className="overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
            width={200}
            height={300}
          />
        </div>
        {/* Gradient overlay at the bottom of the image */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </CardContent>
      <CardFooter className="p-3 flex flex-col items-start gap-2 relative">
        <div className="flex flex-col w-full gap-0.5">
          <span className="text-xs font-bold text-slate-100 uppercase truncate w-full leading-tight">
            {name}
          </span>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-emerald-400 font-mono font-semibold">
              R$ {price}
            </span>
            <span
              className={`flex items-center gap-0.5 text-[10px] font-mono font-medium ${isPositive ? "text-emerald-400" : "text-red-400"
                }`}
            >
              {isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
        >
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
