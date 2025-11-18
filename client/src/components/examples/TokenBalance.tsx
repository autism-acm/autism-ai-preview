import TokenBalance from '../TokenBalance';

export default function TokenBalanceExample() {
  return (
    <div className="p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <TokenBalance balance={0} tier="Free Trial" />
      <TokenBalance balance={150000} tier="Electrum" />
      <TokenBalance balance={350000} tier="Gold" />
    </div>
  );
}
