import { useState } from 'react';
import UpgradeModal from '../UpgradeModal';
import { Button } from '@/components/ui/button';

export default function UpgradeModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Upgrade Modal</Button>
      <UpgradeModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
