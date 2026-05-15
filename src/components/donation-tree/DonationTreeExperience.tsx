import { useMemo, useState, type ChangeEvent } from 'react';
import { CircleDollarSign, HeartHandshake, Target } from 'lucide-react';
import { DonationTree3D } from './DonationTree3D.jsx';
import './donation-tree.css';

const CAMPAIGN_TARGET = 1000;
const CAMPAIGN_NAME = 'Plumbing Repairs';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DonationTreeExperience() {
  const [amount, setAmount] = useState(100);
  const progress = useMemo(() => clamp(amount / CAMPAIGN_TARGET, 0, 1), [amount]);
  const remaining = Math.max(CAMPAIGN_TARGET - amount, 0);

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    setAmount(Number.isFinite(nextValue) ? clamp(nextValue, 0, CAMPAIGN_TARGET) : 0);
  };

  return (
    <div className="donation-tree-root donation-tree-root--embed">
      <section className="donation-panel donation-panel--embed" aria-labelledby="campaign-title">
        <div className="visual-panel visual-panel--embed">
          <DonationTree3D amount={amount} target={CAMPAIGN_TARGET} campaignName={CAMPAIGN_NAME} />
          <div className="progress-track progress-track--embed" aria-hidden="true">
            <span
              style={{
                height: `${progress * 100}%`,
                ['--progress-width' as string]: `${progress * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="campaign-details campaign-details--embed">
          <p className="eyebrow">Live donation preview</p>
          <h2 id="campaign-title">{CAMPAIGN_NAME}</h2>

          <div className="amount-card">
            <label htmlFor="donation-amount">Donation amount</label>
            <div className="amount-input-row">
              <CircleDollarSign aria-hidden="true" />
              <input
                id="donation-amount"
                type="number"
                min={0}
                max={CAMPAIGN_TARGET}
                step={10}
                value={amount}
                onChange={handleAmountChange}
                inputMode="decimal"
                className="form-field"
              />
            </div>
            <input
              className="range"
              type="range"
              min={0}
              max={CAMPAIGN_TARGET}
              step={10}
              value={amount}
              aria-label="Donation amount slider"
              onChange={handleAmountChange}
            />
          </div>

          <div className="stats-grid">
            <div>
              <Target aria-hidden="true" />
              <span>Goal</span>
              <strong>{currency(CAMPAIGN_TARGET)}</strong>
            </div>
            <div>
              <HeartHandshake aria-hidden="true" />
              <span>Preview</span>
              <strong>{Math.round(progress * 100)}%</strong>
            </div>
            <div>
              <CircleDollarSign aria-hidden="true" />
              <span>Remaining</span>
              <strong>{currency(remaining)}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
