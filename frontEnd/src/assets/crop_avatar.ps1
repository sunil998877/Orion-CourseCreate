Add-Type -AssemblyName System.Drawing
$refPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-hero-card.png"
$img = [System.Drawing.Image]::FromFile($refPath)

# Right side starts around X=465, Width = img.Width - 465, Height = img.Height
$cropX = 465
$cropY = 0
$cropW = $img.Width - $cropX
$cropH = $img.Height

$bmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), (New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Create smooth alpha fade on left 60px so it blends seamlessly into the dark card background
$fadeWidth = 60
for ($x = 0; $x -lt $fadeWidth; $x++) {
    $alphaFactor = [Math]::Pow(($x / $fadeWidth), 1.4)
    for ($y = 0; $y -lt $cropH; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        $newA = [int]($pixel.A * $alphaFactor)
        $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($newA, $pixel.R, $pixel.G, $pixel.B))
    }
}

$outPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-hero-avatar.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$img.Dispose()
Write-Output "Saved analytics-hero-avatar.png: $cropW x $cropH"
