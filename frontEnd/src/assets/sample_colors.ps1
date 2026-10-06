Add-Type -AssemblyName System.Drawing
$file = 'c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-hero-avatar-hd.png'
$bmp = [System.Drawing.Bitmap]::FromFile($file)
Write-Output "Size: $($bmp.Width) x $($bmp.Height)"
$points = @(
    @{ Name="Left Edge Top"; X=100; Y=30 },
    @{ Name="Left Edge Mid"; X=100; Y=200 },
    @{ Name="Left Edge Bot"; X=100; Y=380 },
    @{ Name="Top Center"; X=250; Y=30 },
    @{ Name="Top Right"; X=450; Y=30 },
    @{ Name="Bottom Right"; X=450; Y=380 },
    @{ Name="Far Right Mid"; X=$bmp.Width - 10; Y=200 }
)
foreach ($p in $points) {
    $c = $bmp.GetPixel($p.X, $p.Y)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    Write-Output "$($p.Name) ($($p.X), $($p.Y)): R=$($c.R), G=$($c.G), B=$($c.B), Hex=$hex, Alpha=$($c.A)"
}
$bmp.Dispose()
