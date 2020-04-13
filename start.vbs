Set WshShell = WScript.CreateObject("WScript.Shell")
Return = WshShell.Run("cmd.exe /C d: & cd D:\git\get-data-usage & forever start app.js", 0, true)