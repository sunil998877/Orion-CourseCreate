Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-hero-hd.jpg"
$img = [System.Drawing.Image]::FromFile($imgPath)

# Precise bounding box of the avatar + cards:
# X from 46% of width, Y from 40px to 460px (height ~ 420px)
$cropX = [int]($img.Width * 0.46)
$cropY = 40
$cropW = $img.Width - $cropX - 10
$cropH = 425

$bmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Create smooth alpha fade on left 90px
$fadeWidth = 90
for ($x = 0; $x -lt $fadeWidth; $x++) {
    $alphaFactor = [Math]::Pow(($x / $fadeWidth), 1.5)
    for ($y = 0; $y -lt $cropH; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        $newA = [int]($pixel.A * $alphaFactor)
        $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($newA, $pixel.R, $pixel.G, $pixel.B))
    }
}

$outPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-hero-avatar-hd.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$img.Dispose()
Write-Output "Successfully saved tightly cropped analytics-hero-avatar-hd.png: $cropW x $cropH"
