from zoneinfo import ZoneInfo
import pandas as pd
from dotenv import load_dotenv
import os
from pysolar.solar import get_altitude
from Get_Open_Meteo_API import generate_OpenMeteo_data
load_dotenv()


def add_altitude(df, Latitude, Longitude, timezone="Europe/Warsaw"):
    df['Altitude'] = df['date'].apply(
        lambda x: get_altitude(float(Latitude), float(Longitude), x.replace(tzinfo=ZoneInfo(timezone))))
    return df


def add_seasonal_flags(df):
    date = df['date'][0]
    year:str = str(date.year)
    seasons = {'spring': pd.date_range(start='21/03/' + year, end='20/06/' + year),
               'summer': pd.date_range(start='21/06/' + year, end='22/09/' + year),
               'autumn': pd.date_range(start='23/09/' + year, end='20/12/' + year)}
    if date in seasons['spring']:
        df["Is_Spring"] = 1
        df["Is_Summer"] = 0
        df["Is_Fall"] = 0
        df["Is_Winter"] = 0
        return df
    if date in seasons['summer']:
        df["Is_Spring"] = 0
        df["Is_Summer"] = 1
        df["Is_Fall"] = 0
        df["Is_Winter"] = 0
        return df
    if date in seasons['autumn']:
        df["Is_Spring"] = 0
        df["Is_Summer"] = 0
        df["Is_Fall"] = 1
        df["Is_Winter"] = 0
        return df
    else:
        df["Is_Spring"] = 0
        df["Is_Summer"] = 0
        df["Is_Fall"] = 0
        df["Is_Winter"] = 1
        return df


def prepare_weather_data():
    latitude = os.getenv("LATITUDE")
    longitude = os.getenv("LONGITUDE")
    df = generate_OpenMeteo_data(latitude,longitude)
    #df = pd.read_excel("OpenMeteoAPI_forecast.xlsx")
    df = add_altitude(df, latitude, longitude)
    df = add_seasonal_flags(df)
    #df = df.drop(df.columns[:2], axis=1)
    df = df[["temperature_2m", "relative_humidity_2m", "dew_point_2m", "apparent_temperature", "precipitation", "rain",
             "wind_speed_10m", "wind_gusts_10m", "shortwave_radiation_instant", "diffuse_radiation_instant",
             "global_tilted_irradiance_instant", "uv_index", "Altitude", "Is_Spring", "Is_Summer", "weather_code",
             "Is_Fall", "cloud_coverage", "is_day", "surface_pressure", "Is_Winter"]]
   # df.to_excel("Input_data.xlsx")
    return df


