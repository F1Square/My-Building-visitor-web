import { MobileAppPrompt } from '../../components/ui/MobileAppPrompt';
import { PageHeader } from '../../components/ui/PageHeader';

/** Online checkout is mobile-only — this route redirects users to download the app. */
export default function PaymentReview() {
  return (
    <div>
      <PageHeader title="Payment" subtitle="Online checkout is available in the mobile app" />
      <MobileAppPrompt feature="maintenance-payment" variant="card" />
    </div>
  );
}
