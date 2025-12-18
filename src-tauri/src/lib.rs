use tauri::Manager;
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};

/// Tauri command that sends a screenshot to OpenAI's API and receives generated HTML/Tailwind code
///
/// # Arguments
/// * `api_key` - OpenAI API key for authentication
/// * `image_data` - Base64-encoded image data (data URL format)
///
/// # Returns
/// * `Ok(String)` - Generated HTML/Tailwind CSS code
/// * `Err(String)` - Error message if request fails
#[tauri::command]
async fn generate_code(api_key: String, image_data: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&serde_json::json!({
            "model": "gpt-5.1",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert at creating pixel-perfect HTML and Tailwind CSS code from screenshots. Your response should be only the code, with no explanations or extra text."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Convert this screenshot into pixel-perfect HTML code using Tailwind CSS. Add a small amount of padding (like p-2 or p-4) to the outermost div for breathing room. Return only the HTML code, no explanations."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_data
                            }
                        }
                    ]
                }
            ]
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let completion: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
        let content = completion["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string();
        Ok(content)
    } else {
        let error_body = response.text().await.map_err(|e| e.to_string())?;
        Err(format!("Request failed with status: {}", error_body))
    }
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            let _tray = TrayIconBuilder::new()
                .icon(handle.default_window_icon().cloned().unwrap())
                .on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::Click { button, .. } = event {
                        if button == MouseButton::Left {
                            if let Some(window) = handle.get_webview_window("main") {
                                if window.is_visible().unwrap() {
                                    window.hide().unwrap();
                                } else {
                                    window.show().unwrap();
                                    window.set_focus().unwrap();
                                }
                            }
                        }
                    }
                })
                .build(app.handle())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, generate_code])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
