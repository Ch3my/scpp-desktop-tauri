use tauri::{AppHandle, Manager};

// This command must be async so that it doesn't run on the main thread.
// To enable splashcreen on tauri.conf.json add inside windows: []
// {
//     "width": 300,
//     "height": 200,
//     "decorations": false,
//     "visible": false,
//     "url": "/splashscreen.html",
//     "label": "splashscreen",
//     "center": true
//   }
#[tauri::command]
async fn close_splashscreen(
    app: AppHandle,
) -> Result<(), ()> {
    let splash_window = app.get_webview_window("splashscreen").unwrap();
    let main_window = app.get_webview_window("main").unwrap();
    splash_window.close().unwrap();
    main_window.show().unwrap();

    Ok(())
}

#[tauri::command]
async fn show_main_window(
    app: AppHandle,
) -> Result<(), ()> {
    let main_window = app.get_webview_window("main").unwrap();
    main_window.show().unwrap();
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![close_splashscreen, show_main_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
