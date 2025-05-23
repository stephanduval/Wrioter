<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="{{ asset('favicon.ico') }}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Freynet-Gagné Customer Portal</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('loader.css') }}" />
  @if (app()->environment('production'))
    @php
      $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
      $entry = $manifest['resources/ts/main.ts'];
    @endphp
    <script type="module" src="{{ asset('build/' . $entry['file']) }}"></script>
    @foreach ($entry['css'] ?? [] as $css)
      <link rel="stylesheet" href="{{ asset('build/' . $css) }}">
    @endforeach
  @else
    @vite(['resources/ts/main.ts'])
  @endif

</head>

<body>
  <div id="app">
    <div id="loading-bg">
      <div class="loading-logo">
        <!-- SVG Logo -->
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(0.5,0,0,0.5,25,20)">
            <path
              style="fill:var(--initial-loader-color);stroke-width:1.60678"
              d="m 2.5321417,66.252597 c 0,-30.098445 0.496142,-40.347157 2.008471,-41.488638 C 5.6452717,23.93018 15.782641,19.424791 27.068101,14.75198 l 20.519018,-8.496016 7.317312,6.744863 c 12.225473,11.269046 18.792159,13.285667 46.133459,14.167519 20.92483,0.674899 24.40875,1.183397 28.92198,4.221327 5.06533,3.409558 8.36548,8.465646 9.41398,14.423007 0.44763,2.543297 -2.96147,4.494551 -20.35039,11.647881 -11.48846,4.726038 -21.629865,8.593358 -22.536463,8.594046 -0.906599,6.86e-4 -3.075748,-3.062613 -4.82033,-6.807333 C 87.089148,49.421704 80.628279,46.280693 63.290092,45.451744 L 49.128667,44.774678 v 20.887896 c 0,14.815096 -0.583929,21.337099 -2.008471,22.432966 -2.406794,1.851488 -41.1836493,18.12973 -43.1873383,18.12973 -0.770393,0 -1.400716,-17.987701 -1.400716,-39.972673 z M 33.510524,89.395114 44.404195,84.957071 43.954573,65.48156 43.504948,46.006047 36.066576,44.944437 C 27.252813,43.68653 15.472516,38.733684 12.377755,34.984836 11.164888,33.515625 9.5380277,32.313544 8.7625067,32.313544 c -0.775518,0 -1.410034,15.181093 -1.410034,33.735762 v 33.735763 l 7.6321883,-2.975957 c 4.197705,-1.636775 12.534342,-4.973075 18.525863,-7.413998 z"
            />
          </g>
        </svg>
      </div>
      <div class=" loading">
        <div class="effect-1 effects"></div>
        <div class="effect-2 effects"></div>
        <div class="effect-3 effects"></div>
      </div>
    </div>
  </div>
  
  <script>
    const loaderColor = localStorage.getItem('sneat-initial-loader-bg') || '#FFFFFF'
    const primaryColor = localStorage.getItem('sneat-initial-loader-color') || '#696CFF'

    if (loaderColor)
      document.documentElement.style.setProperty('--initial-loader-bg', loaderColor)

    if (primaryColor)
      document.documentElement.style.setProperty('--initial-loader-color', primaryColor)
  </script>
</body>

</html>
