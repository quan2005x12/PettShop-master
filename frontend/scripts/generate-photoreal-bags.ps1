Add-Type -AssemblyName System.Drawing

$basePath = 'd:\WORKSPACE\pett-shop\public\images\products\_stitch_check_v3\cand-02.jpg'
$outDir = 'd:\WORKSPACE\pett-shop\public\images\products'

if (-not (Test-Path $basePath)) {
  throw "Base image not found: $basePath"
}

$variants = @(
  @{ Id='01'; Bg='#f2a65a'; Panel='#fff7f0'; Accent='#e85d04'; Title='SALMON OMEGA'; Sub='Adult Complete'; Badge='ADULT' },
  @{ Id='02'; Bg='#f6bd60'; Panel='#fff8eb'; Accent='#e09f3e'; Title='PRO ACTIVE PUPPY'; Sub='Growth Formula'; Badge='PUPPY' },
  @{ Id='03'; Bg='#84a59d'; Panel='#eef7f5'; Accent='#2a9d8f'; Title='SENSITIVE LAMB'; Sub='Skin and Coat'; Badge='SENSITIVE' },
  @{ Id='04'; Bg='#9f86c0'; Panel='#f4f0fb'; Accent='#7b2cbf'; Title='GRAIN FREE TURKEY'; Sub='Digestive Balance'; Badge='GRAIN FREE' },
  @{ Id='05'; Bg='#7cb518'; Panel='#f5faea'; Accent='#55a630'; Title='SMALL BREED MINI'; Sub='Small Kibble'; Badge='SMALL BREED' },
  @{ Id='06'; Bg='#4895ef'; Panel='#eef5ff'; Accent='#1d4ed8'; Title='LARGE BREED MAXI'; Sub='Joint and Muscle'; Badge='LARGE BREED' },
  @{ Id='07'; Bg='#bc6c25'; Panel='#fff4e8'; Accent='#99582a'; Title='SENIOR JOINT'; Sub='7 Plus Mobility'; Badge='SENIOR' },
  @{ Id='08'; Bg='#e76f51'; Panel='#fff2ee'; Accent='#d9480f'; Title='HIGH ENERGY SPORT'; Sub='Performance Dogs'; Badge='HIGH ENERGY' },
  @{ Id='09'; Bg='#2a9d8f'; Panel='#eefaf7'; Accent='#0f766e'; Title='DIGESTIVE PRO'; Sub='Probiotic Care'; Badge='PROBIOTIC' },
  @{ Id='10'; Bg='#6c757d'; Panel='#f3f5f7'; Accent='#495057'; Title='WEIGHT CONTROL'; Sub='Light Formula'; Badge='LIGHT' }
)

foreach ($v in $variants) {
  $bmp = [System.Drawing.Bitmap]::FromFile($basePath)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bgColor = [System.Drawing.ColorTranslator]::FromHtml($v.Bg)
  $accent = [System.Drawing.ColorTranslator]::FromHtml($v.Accent)
  $scaleX = $bmp.Width / 1024.0
  $scaleY = $bmp.Height / 1024.0

  $fx = {
    param([double]$n)
    return [single]($n * $scaleX)
  }

  $fy = {
    param([double]$n)
    return [single]($n * $scaleY)
  }

  $fs = {
    param([double]$n)
    return [single]($n * [Math]::Min($scaleX, $scaleY))
  }

  $bgOverlay = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(58, $bgColor.R, $bgColor.G, $bgColor.B))
  $g.FillRectangle($bgOverlay, 0, 0, $bmp.Width, $bmp.Height)

  $ribbonBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, $accent.R, $accent.G, $accent.B))
  $g.FillRectangle($ribbonBrush, (& $fx 315), (& $fy 248), (& $fx 390), (& $fy 44))

  $fontLogo = New-Object System.Drawing.Font('Segoe UI', (& $fs 18), [System.Drawing.FontStyle]::Bold)
  $fontTitle = New-Object System.Drawing.Font('Segoe UI', (& $fs 28), [System.Drawing.FontStyle]::Bold)
  $fontSub = New-Object System.Drawing.Font('Segoe UI', (& $fs 16), [System.Drawing.FontStyle]::Regular)
  $fontBadge = New-Object System.Drawing.Font('Segoe UI', (& $fs 15), [System.Drawing.FontStyle]::Bold)

  $center = New-Object System.Drawing.StringFormat
  $center.Alignment = [System.Drawing.StringAlignment]::Center
  $center.LineAlignment = [System.Drawing.StringAlignment]::Center

  $whiteBrush = [System.Drawing.Brushes]::White
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 48, 56))
  $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(100, 108, 118))

  $g.DrawString('PETT', $fontLogo, $whiteBrush, (New-Object System.Drawing.RectangleF((& $fx 320), (& $fy 250), (& $fx 380), (& $fy 40))), $center)
  $g.DrawString($v.Title, $fontTitle, $textBrush, (New-Object System.Drawing.RectangleF((& $fx 350), (& $fy 420), (& $fx 320), (& $fy 72))), $center)
  $g.DrawString($v.Sub, $fontSub, $subBrush, (New-Object System.Drawing.RectangleF((& $fx 350), (& $fy 502), (& $fx 320), (& $fy 40))), $center)
  $g.DrawString('Premium Dog Food', $fontSub, $subBrush, (New-Object System.Drawing.RectangleF((& $fx 350), (& $fy 542), (& $fx 320), (& $fy 34))), $center)
  $g.DrawString($v.Badge, $fontBadge, $textBrush, (New-Object System.Drawing.RectangleF((& $fx 350), (& $fy 610), (& $fx 320), (& $fy 34))), $center)

  $quality = [System.Drawing.Imaging.Encoder]::Quality
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($quality, 95L)

  $outPath = Join-Path $outDir ("dog-food-$($v.Id).jpg")
  $bmp.Save($outPath, $encoder, $encParams)

  $bgOverlay.Dispose()
  $ribbonBrush.Dispose()
  $textBrush.Dispose()
  $subBrush.Dispose()
  $fontLogo.Dispose()
  $fontTitle.Dispose()
  $fontSub.Dispose()
  $fontBadge.Dispose()
  $center.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

Get-ChildItem $outDir -Filter 'dog-food-*.jpg' | Sort-Object Name | Select-Object Name,Length,LastWriteTime
