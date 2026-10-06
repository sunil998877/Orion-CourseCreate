Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\homepage-hero-reference.png"
$img = [System.Drawing.Image]::FromFile($imgPath)

$cropX = 512
$cropY = 12
$cropW = $img.Width - $cropX - 12
$cropH = $img.Height - 24

$bmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Now create a smooth horizontal alpha fade on the left 80 pixels so it transitions seamlessly into any background
$fadeWidth = 80
for ($x = 0; $x -lt $fadeWidth; $x++) {
    $alphaFactor = [Math]::Pow(($x / $fadeWidth), 1.5)
    for ($y = 0; $y -lt $cropH; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        $newA = [int]($pixel.A * $alphaFactor)
        $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($newA, $pixel.R, $pixel.G, $pixel.B))
    }
}

$outPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\hero-scene.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$img.Dispose()
Write-Output "Saved perfectly alpha-faded hero-scene.png!"
