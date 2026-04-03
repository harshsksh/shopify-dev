@echo off
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
cargo build --target=wasm32-wasip1 --release
