from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import pandas as pd
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache for session data
session_cache = {}

@app.get("/")
async def read_root():
    return {"message": "F1 Lap Time Analyzer API"}

@app.get("/years")
async def get_years() -> List[int]:
    try:
        # Get available years from FastF1
        years = list(range(2018, 2024))  # FastF1 supports 2018 onwards
        return years
    except Exception as e:
        logger.error(f"Error fetching years: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/races/{year}")
async def get_races(year: int) -> List[Dict]:
    try:
        # Get all races for the year
        session = fastf1.get_session(year, 1, 'R')  # Get first race to initialize
        schedule = fastf1.get_event_schedule(year)
        
        races = []
        for _, event in schedule.iterrows():
            races.append({
                "round": int(event['RoundNumber']),
                "name": event['EventName'],
                "date": event['EventDate'].strftime('%Y-%m-%d')
            })
        return races
    except Exception as e:
        logger.error(f"Error fetching races for year {year}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/drivers/{year}/{round}")
async def get_drivers(year: int, round: int) -> List[Dict]:
    try:
        # Get drivers for the specific race
        session = fastf1.get_session(year, round, 'R')
        session.load()
        
        drivers = []
        for driver in session.drivers:
            driver_info = session.get_driver(driver)
            drivers.append({
                "code": driver,
                "name": f"{driver_info.FirstName} {driver_info.LastName}",
                "team": driver_info.TeamName
            })
        return drivers
    except Exception as e:
        logger.error(f"Error fetching drivers for year {year} round {round}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/lap-times/{year}/{round}/{driver1}/{driver2}")
async def get_lap_times(year: int, round: int, driver1: str, driver2: str) -> Dict:
    try:
        # Get lap times for both drivers
        session = fastf1.get_session(year, round, 'R')
        session.load()
        
        # Get lap data for both drivers
        laps1 = session.laps.pick_driver(driver1)
        laps2 = session.laps.pick_driver(driver2)
        
        # Convert to list of dictionaries
        driver1_times = []
        for _, lap in laps1.iterrows():
            if pd.notna(lap['LapTime']):
                driver1_times.append({
                    "lap": int(lap['LapNumber']),
                    "time": float(lap['LapTime'].total_seconds())
                })
        
        driver2_times = []
        for _, lap in laps2.iterrows():
            if pd.notna(lap['LapTime']):
                driver2_times.append({
                    "lap": int(lap['LapNumber']),
                    "time": float(lap['LapTime'].total_seconds())
                })
        
        return {
            "driver1": {
                "code": driver1,
                "times": driver1_times
            },
            "driver2": {
                "code": driver2,
                "times": driver2_times
            }
        }
    except Exception as e:
        logger.error(f"Error fetching lap times: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
