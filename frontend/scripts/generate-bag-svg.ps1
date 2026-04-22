$dest = 'd:\WORKSPACE\pett-shop\public\images\products'
$items = @(
  @{ Id='01'; Sku='SALMON OMEGA ADULT'; Sub='Adult Complete Nutrition'; Top='#ec6b5f'; Mid='#ffe9d8'; Bot='#fffdf8' },
  @{ Id='02'; Sku='PRO ACTIVE PUPPY'; Sub='Growth and Immunity Formula'; Top='#f4b400'; Mid='#fff2c7'; Bot='#fffef7' },
  @{ Id='03'; Sku='SENSITIVE SKIN LAMB'; Sub='Hypoallergenic Care'; Top='#3db7ad'; Mid='#d9f5f2'; Bot='#f8fffe' },
  @{ Id='04'; Sku='GRAIN FREE TURKEY'; Sub='Low Grain Digestive Balance'; Top='#8f7ae6'; Mid='#ece6ff'; Bot='#fbfaff' },
  @{ Id='05'; Sku='SMALL BREED MINI'; Sub='Small Kibble Daily Support'; Top='#2f9e44'; Mid='#daf5df'; Bot='#f7fff8' },
  @{ Id='06'; Sku='LARGE BREED MAXI'; Sub='Joint and Muscle Care'; Top='#1f7eb7'; Mid='#d8edf9'; Bot='#f8fdff' },
  @{ Id='07'; Sku='SENIOR JOINT SUPPORT'; Sub='7 Plus Age Healthy Mobility'; Top='#b5762d'; Mid='#f8e6cf'; Bot='#fffaf5' },
  @{ Id='08'; Sku='HIGH ENERGY SPORT'; Sub='Performance Working Dogs'; Top='#d9480f'; Mid='#ffe2d1'; Bot='#fff8f4' },
  @{ Id='09'; Sku='DIGESTIVE PROBIOTIC'; Sub='Gut Health and Fiber Blend'; Top='#0f766e'; Mid='#d4f3f0'; Bot='#f7fffe' },
  @{ Id='10'; Sku='WEIGHT CONTROL LIGHT'; Sub='Lean Calories Full Nutrition'; Top='#6b7280'; Mid='#eceff3'; Bot='#fafbfc' }
)

foreach ($item in $items) {
  $svg = @"
<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1500' viewBox='0 0 1200 1500'>
  <defs>
    <linearGradient id='bg' x1='0' x2='0' y1='0' y2='1'>
      <stop offset='0%' stop-color='#f7f4ea'/>
      <stop offset='100%' stop-color='#ece8db'/>
    </linearGradient>
    <linearGradient id='bagBody' x1='0' x2='0' y1='0' y2='1'>
      <stop offset='0%' stop-color='$($item.Mid)'/>
      <stop offset='100%' stop-color='$($item.Bot)'/>
    </linearGradient>
    <filter id='shadow' x='-20%' y='-20%' width='140%' height='160%'>
      <feDropShadow dx='0' dy='24' stdDeviation='22' flood-color='#000000' flood-opacity='0.18'/>
    </filter>
  </defs>

  <rect width='1200' height='1500' fill='url(#bg)'/>
  <ellipse cx='600' cy='1310' rx='320' ry='70' fill='#000' opacity='0.12'/>

  <g filter='url(#shadow)'>
    <path d='M390 180 L810 180 L850 330 L850 1220 Q850 1270 800 1270 L400 1270 Q350 1270 350 1220 L350 330 Z' fill='url(#bagBody)'/>
    <rect x='350' y='180' width='500' height='72' rx='10' fill='$($item.Top)'/>
    <rect x='350' y='252' width='500' height='30' fill='#f9fafb' opacity='0.75'/>

    <rect x='420' y='430' width='360' height='520' rx='28' fill='#ffffff' opacity='0.96'/>
    <circle cx='600' cy='510' r='56' fill='$($item.Top)'/>
    <text x='600' y='526' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='44' font-weight='700' fill='#ffffff'>PETT</text>

    <text x='600' y='615' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='44' font-weight='800' fill='#1f2937'>$($item.Sku)</text>
    <text x='600' y='664' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='26' font-weight='600' fill='#4b5563'>$($item.Sub)</text>

    <line x1='500' y1='710' x2='700' y2='710' stroke='$($item.Top)' stroke-width='7' stroke-linecap='round'/>
    <text x='600' y='760' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='24' fill='#6b7280'>Premium Dog Food Formula</text>
    <text x='600' y='800' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='24' fill='#6b7280'>Net Wt. 1.5kg</text>

    <rect x='470' y='1040' width='260' height='84' rx='20' fill='$($item.Top)' opacity='0.9'/>
    <text x='600' y='1092' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='34' font-weight='800' fill='#ffffff'>DOG</text>
  </g>
</svg>
"@

  $outPath = Join-Path $dest ("dog-food-$($item.Id).svg")
  Set-Content -Path $outPath -Value $svg -Encoding UTF8
}

Get-ChildItem $dest -Filter 'dog-food-*.svg' | Sort-Object Name | Select-Object Name, Length, LastWriteTime
