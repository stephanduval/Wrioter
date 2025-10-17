<!-- Language -->
<li class="nav-item dropdown-language dropdown me-2 me-xl-0">
  <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
    <i class='icon-base bx bx-globe icon-sm me-1'></i>
  </a>
  <ul class="dropdown-menu dropdown-menu-end">
    <li>
      <a class="dropdown-item {{ app()->getLocale() === 'en' ? 'active' : '' }}" href="{{url('lang/en')}}" data-language="en" data-text-direction="ltr">
        <span class="align-middle">English</span>
      </a>
    </li>
    <li>
      <a class="dropdown-item {{ app()->getLocale() === 'fr' ? 'active' : '' }}" href="{{url('lang/fr')}}" data-language="fr" data-text-direction="ltr">
        <span class="align-middle">French</span>
      </a>
    </li>
  </ul>
</li>
<!--/ Language --> 
