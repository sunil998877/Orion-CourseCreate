Add-Type -AssemblyName System.Drawing
$file = 'c:\Users\skp66\Downloads\courseCreator (1)\courseCreator\courseCreator\frontEnd\src\assets\analytics-user-target.png'
$bmp = [System.Drawing.Bitmap]::FromFile($file)
Write-Output "User Target Image Size: $($bmp.Width) x $($bmp.Height)"
$points = @(
    @{ Name="Top Left (near badge)"; X=100; Y=50 },
    @{ Name="Left Mid (behind title)"; X=100; Y=150 },
    @{ Name="Left Lower (behind agent card)"; X=100; Y=250 },
    @{ Name="Left Bottom corner"; X=50; Y=$bmp.Height - 30 },
    @{ Name="Center Top"; X=450; Y=50 },
    @{ Name="Center Mid"; X=450; Y=150 },
    @{ Name="Center Bottom"; X=450; Y=280 },
    @{ Name="Right Top (behind charts)"; X=800; Y=50 },
    @{ Name="Right Mid (behind avatar)"; X=800; Y=150 },
    @{ Name="Right Bottom"; X=800; Y=280 },
    @{ Name="Far Right Top"; X=$bmp.Width - 50; Y=50 },
    @{ Name="Far Right Bottom"; X=$bmp.Width - 50; Y=280 }
)
foreach ($p in $points) {
    $c = $bmp.GetPixel($p.X, $p.Y)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    Write-Output "$($p.Name) ($($p.X), $($p.Y)): R=$($c.R), G=$($c.G), B=$($c.B), Hex=$hex"
}
$bmp.Dispose()
