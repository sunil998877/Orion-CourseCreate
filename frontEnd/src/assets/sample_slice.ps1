Add-Type -AssemblyName System.Drawing
$file = 'c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-hero-hd.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($file)
Write-Output "Sampling vertical slices on right side (x=1000) at different Y:"
for ($y = 50; $y -lt $bmp.Height; $y += 70) {
    $c = $bmp.GetPixel(1000, $y)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    Write-Output "Y=$y : Hex=$hex"
}
$bmp.Dispose()
