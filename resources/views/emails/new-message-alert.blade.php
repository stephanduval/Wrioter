<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Message Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #1976D2; /* Default Vuetify primary blue */
            color: #FFFFFF !important; /* Force white color */
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
        }
        .button:hover {
            color: #FFFFFF !important; /* Keep white on hover */
            text-decoration: none;
        }
        .button:visited {
            color: #FFFFFF !important; /* Keep white after visited */
        }
        .button:active {
            color: #FFFFFF !important; /* Keep white when clicked */
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <h2>New Message Alert</h2>
    
    <p>There has been a new message sent to info@freynet-gagne.com from the Freynet-Gagne web portal.</p>
    
    <p>Please log in to view the message:</p>
    
    <a href="{{ config('app.url') }}/login" class="button" style="color: #FFFFFF !important;">Log in to Portal</a>
    
    <div class="footer">
        <p>This is an automated message from the Freynet-Gagne web portal.</p>
        <p>If you did not expect this message, please ignore it.</p>
    </div>
</body>
</html> 
