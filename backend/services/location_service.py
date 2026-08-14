import requests
from flask import current_app

class LocationService:
    def __init__(self):
        self.access_token = current_app.config.get("MAPBOX_ACCESS_TOKEN")
        self.base_url = "https://api.mapbox.com/geocoding/v5/mapbox.places"

    def geocode(self, address_string):
        """
        Convert an address string to [longitude, latitude].
        """
        if not self.access_token:
            return None
            
        try:
            url = f"{self.base_url}/{requests.utils.quote(address_string)}.json"
            params = {
                "access_token": self.access_token,
                "limit": 1
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            if data.get("features") and len(data["features"]) > 0:
                # Mapbox returns coordinates as [longitude, latitude]
                return data["features"][0]["center"]
            return None
        except Exception as e:
            print(f"Mapbox geocoding error: {e}")
            return None
            
    def calculate_distance(self, lon1, lat1, lon2, lat2):
        """
        Calculate straight-line distance (haversine) between two coordinates in km.
        """
        from math import radians, cos, sin, asin, sqrt
        
        # Convert decimal degrees to radians 
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        
        # Haversine formula 
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a)) 
        r = 6371 # Radius of earth in kilometers
        return c * r
