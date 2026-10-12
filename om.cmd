@echo off
REM OpenMontage 启动脚本（Windows）
REM 用隔离的 Python venv + Node.js，可直接调用 pipeline、preflight、demo 渲染。

setlocal
set "PROJECT_ROOT=%~dp0"
set "PYTHON_EXE=C:\Users\丛利\.workbuddy\binaries\python\envs\default\Scripts\python.exe"
set "NODE_EXE=C:\Users\丛利\.workbuddy\binaries\node\versions\22.22.2\node.exe"
set "NODE_PATH=C:\Program Files\nodejs"
set "PY_VENV_SCRIPTS=C:\Users\丛利\.workbuddy\binaries\python\envs\default\Scripts"

set "PATH=%PY_VENV_SCRIPTS%;%NODE_PATH%;%PATH%"

cd /d "%PROJECT_ROOT%"

if "%1"=="" goto help
if "%1"=="preflight" (
    "%PYTHON_EXE%" -c "import sys; sys.path.insert(0,'.'); from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.provider_menu_summary(), indent=2, ensure_ascii=False))"
    goto end
)
if "%1"=="demo" (
    "%PYTHON_EXE%" render_demo.py %2 %3 %4
    goto end
)
if "%1"=="render" (
    shift
    set "ARGS=%1 %2 %3 %4 %5 %6 %7 %8 %9"
    if "%ARGS%"=="" (
        "%PYTHON_EXE%" render_demo.py
    ) else (
        "%PYTHON_EXE%" render_demo.py %1 %2 %3 %4 %5 %6 %7 %8 %9
    )
    goto end
)
if "%1"=="doctor" (
    "%PYTHON_EXE%" -c "from tools.video.hyperframes_compose import HyperFramesCompose; r=HyperFramesCompose().execute({'operation':'doctor'}); import json; print(json.dumps(r.data, indent=2)); print('OK' if r.success else 'FAIL: '+str(r.error))"
    goto end
)
if "%1"=="shell" (
    "%PYTHON_EXE%"
    goto end
)
if "%1"=="list" (
    "%PYTHON_EXE%" render_demo.py --list
    goto end
)

"%PYTHON_EXE%" %*

:help
echo OpenMontage command wrapper
echo.
echo   om preflight              Run capability discovery and print provider menu
echo   om demo [name]            Render zero-key demo(s). name = world-in-numbers ^| code-to-screen ^| focusflow-pitch
echo   om list                   List available demos
echo   om doctor                 Run HyperFrames doctor
echo   om shell                  Drop into the project Python REPL
echo   om ^<args^>                Run any python script in the project (e.g. om run_pipeline.py ...)
echo.

:end
endlocal