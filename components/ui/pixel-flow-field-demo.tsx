import PixelFlowField from "@/components/ui/pixel-flow-field";

export default function PixelFlowFieldDemo() {
  return (
    <div className="relative h-screen w-full bg-background">
      <PixelFlowField className="h-full w-full" text="Text Preview" shape="square" />
    </div>
  );
}

export { PixelFlowFieldDemo };
