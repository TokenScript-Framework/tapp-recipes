import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface PriceDisplayProps {
  price: bigint;
}

export function PriceDisplay({ price }: PriceDisplayProps) {
  function formatPrice(price: bigint) {
    const etherValue = ethers.formatEther(price);
    return parseFloat(etherValue).toFixed(4);
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{formatPrice(price)}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{String(price)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
