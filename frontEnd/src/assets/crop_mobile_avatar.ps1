Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\homepage-hero-bg.jpg"
$img = [System.Drawing.Image]::FromFile($imgPath)
Write-Output "Image Dimensions: $($img.Width) x $($img.Height)"

# Mobile crop: focus on the 3D Avatar, speech bubble, podium and floating pills
# X from ~50% to 100%, full height
$cropX = [int]($img.Width * 0.49)
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

$outPath = "c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\hero-avatar-mobile.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$img.Dispose()
Write-Output "Saved mobile avatar crop: $cropW x $cropH"
