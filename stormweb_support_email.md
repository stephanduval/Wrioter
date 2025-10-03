# Email to StormWeb Technical Support

**To:** support@stormweb.ca
**Subject:** PHP ZipArchive Extension Needed - stephandouglasduval.com

---

Hello StormWeb Support Team,

I need assistance enabling the PHP ZipArchive extension for my website hosted on your CloudPanel VPS.

**Account Details:**
- Domain: stephandouglasduval.com
- Server IP: 23.180.104.108
- CloudPanel User: sduval

**Issue:**
I've deployed a Laravel application that requires the ZipArchive PHP extension. While the extension is installed on the server and works via command line, it's not accessible through the web server (PHP-FPM).

**Current Status:**
- The zip extension is installed for PHP 8.2, 8.3, and 8.4
- Running `php -m | grep zip` shows the extension is loaded in CLI
- However, accessing the website returns: "Class 'ZipArchive' not found"
- This appears to be a CloudPanel PHP-FPM configuration issue

**What I Need:**
Could you please enable the ZipArchive/zip extension for the PHP-FPM pool serving stephandouglasduval.com? This is a standard PHP extension required by Laravel for handling compressed files.

**Technical Details:**
- The site is currently using PHP-FPM on port 18003
- The FPM pool configuration is at: `/etc/php/8.2/fpm/pool.d/stephandouglasduval.com.conf`
- The extension just needs to be enabled in the PHP-FPM configuration

This is blocking my Laravel application from running. Once this extension is enabled, the site should work correctly.

Thank you for your assistance!

Best regards,
[Your name]