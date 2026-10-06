Add-Type -AssemblyName System.Drawing
$file = 'c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-hero-hd.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($file)
Write-Output "Full HD Image Size: $($bmp.Width) x $($bmp.Height)"
$points = @(
    @{ Name="Top Left"; X=100; Y=100 },
    @{ Name="Mid Left"; X=100; Y=384 },
    @{ Name="Bot Left"; X=100; Y=650 },
    @{ Name="Center Left Top"; X=400; Y=150 },
    @{ Name="Center Left Mid"; X=400; Y=384 },
    @{ Name="Center Left Bot"; X=400; Y=650 }
)
foreach ($p in $points) {
    $c = $bmp.GetPixel($p.X, $p.Y)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    Write-Output "$($p.Name) ($($p.X), $($p.Y)): Hex=$hex"
}
$bmp.Dispose()
