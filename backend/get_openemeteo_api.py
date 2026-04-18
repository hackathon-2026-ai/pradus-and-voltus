import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
import pytz


def generate_OpenMeteo_data(latitude, longitude, panel_tilt: int = 45, timezone="Europe/Warsaw"):
    # Strefa czasowa Warszawy
    warsaw_tz = pytz.timezone(timezone)
    # Set up the Open-Meteo API client with cache and retry on error
    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    # Make sure all required weather variables are listed here
    # The order of variables in hourly or daily is important to assign them correctly below
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "relative_humidity_2m", "dew_point_2m", "apparent_temperature", "precipitation",
                   "rain", "weather_code", "surface_pressure", "cloud_cover", "wind_speed_10m", "wind_gusts_10m",
                   "uv_index", "is_day", "shortwave_radiation_instant", "diffuse_radiation_instant",
                   "global_tilted_irradiance_instant"],
        "forecast_days": 1,
        "tilt": panel_tilt
    }
    responses = openmeteo.weather_api(url, params=params)

    # Process first location. Add a for-loop for multiple locations or weather models
    response = responses[0]
    print(f"Coordinates {response.Latitude()}°N {response.Longitude()}°E")
    print(f"Elevation {response.Elevation()} m asl")
    print(f"Timezone {response.Timezone()} {response.TimezoneAbbreviation()}")
    print(f"Timezone difference to GMT+0 {response.UtcOffsetSeconds()} s")

    # Process hourly data. The order of variables needs to be the same as requested.
    hourly = response.Hourly()
    hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
    hourly_relative_humidity_2m = hourly.Variables(1).ValuesAsNumpy()
    hourly_dew_point_2m = hourly.Variables(2).ValuesAsNumpy()
    hourly_apparent_temperature = hourly.Variables(3).ValuesAsNumpy()
    hourly_precipitation = hourly.Variables(4).ValuesAsNumpy()
    hourly_rain = hourly.Variables(5).ValuesAsNumpy()
    hourly_weather_code = hourly.Variables(6).ValuesAsNumpy()
    hourly_surface_pressure = hourly.Variables(7).ValuesAsNumpy()
    hourly_cloud_cover = hourly.Variables(8).ValuesAsNumpy()
    hourly_wind_speed_10m = hourly.Variables(9).ValuesAsNumpy()
    hourly_wind_gusts_10m = hourly.Variables(10).ValuesAsNumpy()
    hourly_uv_index = hourly.Variables(11).ValuesAsNumpy()
    hourly_is_day = hourly.Variables(12).ValuesAsNumpy()
    hourly_shortwave_radiation_instant = hourly.Variables(13).ValuesAsNumpy()
    hourly_diffuse_radiation_instant = hourly.Variables(14).ValuesAsNumpy()
    hourly_global_tilted_irradiance_instant = hourly.Variables(15).ValuesAsNumpy()

    hourly_data = {"date": pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    )}
    hourly_data["temperature_2m"] = hourly_temperature_2m
    hourly_data["relative_humidity_2m"] = hourly_relative_humidity_2m
    hourly_data["dew_point_2m"] = hourly_dew_point_2m
    hourly_data["apparent_temperature"] = hourly_apparent_temperature
    hourly_data["precipitation"] = hourly_precipitation
    hourly_data["rain"] = hourly_rain
    hourly_data["wind_speed_10m"] = hourly_wind_speed_10m
    hourly_data["wind_gusts_10m"] = hourly_wind_gusts_10m
    hourly_data["shortwave_radiation_instant"] = hourly_shortwave_radiation_instant
    hourly_data["diffuse_radiation_instant"] = hourly_diffuse_radiation_instant
    hourly_data["global_tilted_irradiance_instant"] = hourly_global_tilted_irradiance_instant
    hourly_data["uv_index"] = hourly_uv_index
    hourly_data["weather_code"] = hourly_weather_code
    hourly_data["cloud_coverage"] = hourly_cloud_cover
    hourly_data["is_day"] = hourly_is_day
    hourly_data["surface_pressure"] = hourly_surface_pressure

    hourly_dataframe = pd.DataFrame(data=hourly_data)
    hourly_dataframe["date"] = hourly_dataframe["date"].dt.tz_convert(warsaw_tz).dt.tz_localize(None)
    hourly_dataframe.to_excel("OpenMeteoAPI_forecast.xlsx")
    return hourly_dataframe