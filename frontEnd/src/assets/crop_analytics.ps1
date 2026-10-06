Add-Type -AssemblyName System.Drawing
$refPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-reference.png"
$img = [System.Drawing.Image]::FromFile($refPath)
Write-Output "Image Dimensions: $($img.Width) x $($img.Height)"

# In analytics-reference.png:
# The image height is around 550px, width is 1024px.
# The top hero card starts at around Y = 15, X = 20, Width = 984, Height = 300.
# Let's crop the top hero card area cleanly.
$cropX = 20
$cropY = 15
$cropW = $img.Width - 40
$cropH = [int]($img.Height * 0.54)

Write-Output "Top card rect: X=$cropX, Y=$cropY, W=$cropW, H=$cropH"

$bmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), (New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$outPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-hero-card.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$img.Dispose()
Write-Output "Saved analytics-hero-card.png!"
