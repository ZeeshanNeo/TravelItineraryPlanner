@echo off
echo Starting Voyager Pro on Docker...
docker-compose up -d --build
echo.
echo Application will be available at:
echo Frontend: http://localhost:8085
echo Backend API: http://localhost:8085/api/health
echo Swagger: http://localhost:5282/swagger/index.html
echo.
echo To see logs, run: docker-compose logs -f
pause
