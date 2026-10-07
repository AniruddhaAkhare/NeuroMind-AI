"""
Doctor and Hospital directory routes (with Mapbox geosearch support).
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from extensions import db
from database.models.appointment import Doctor, Hospital, DoctorHospitalAffiliation
from database.models.user import User
from services.location_service import LocationService

doctor_bp = Blueprint("doctor", __name__)


# ============================================================
# SEARCH HOSPITALS (Geospatial)
# ============================================================

@doctor_bp.route("/hospitals/search", methods=["GET"])
@jwt_required()
def search_hospitals():
    """
    Search hospitals by name/city, optionally sort by distance 
    if user provides their coordinates.
    """
    query_str = request.args.get("q", "", type=str)
    user_lat = request.args.get("lat", type=float)
    user_lon = request.args.get("lon", type=float)
    
    query = Hospital.query.filter_by(is_active=True)
    
    if query_str:
        query = query.filter(
            db.or_(
                Hospital.name.ilike(f"%{query_str}%"),
                Hospital.city.ilike(f"%{query_str}%"),
                Hospital.state.ilike(f"%{query_str}%")
            )
        )
        
    hospitals = query.all()
    
    results = []
    location_service = LocationService()
    
    for h in hospitals:
        data = h.to_dict()
        data["distance_km"] = None
        
        # Calculate distance if we have both sets of coordinates
        if user_lat is not None and user_lon is not None and h.latitude is not None and h.longitude is not None:
            data["distance_km"] = round(location_service.calculate_distance(
                lon1=user_lon, lat1=user_lat,
                lon2=h.longitude, lat2=h.latitude
            ), 2)
            
        # Get affiliated doctors count
        data["doctor_count"] = len(h.doctor_affiliations)
        
        results.append(data)
        
    # Sort by distance if calculated
    if user_lat is not None and user_lon is not None:
        results.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else float('inf'))
        
    return jsonify({
        "success": True,
        "hospitals": results
    }), 200


@doctor_bp.route("/hospitals/<int:hospital_id>", methods=["GET"])
@jwt_required()
def get_hospital(hospital_id):
    h = Hospital.query.get(hospital_id)
    if not h:
        return jsonify({"success": False, "error": "Hospital not found"}), 404
    data = h.to_dict()
    data["doctor_count"] = len(h.doctor_affiliations)
    return jsonify({
        "success": True,
        "hospital": data
    }), 200

# ============================================================
# LIST DOCTORS (By Specialization / Hospital)
# ============================================================

@doctor_bp.route("/doctors", methods=["GET"])
@jwt_required()
def list_doctors():
    hospital_id = request.args.get("hospital_id", type=int)
    specialization = request.args.get("specialization", type=str)
    
    query = Doctor.query.filter_by(is_available=True)
    
    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))
        
    if hospital_id:
        query = query.join(DoctorHospitalAffiliation).filter(
            DoctorHospitalAffiliation.hospital_id == hospital_id
        )
        
    doctors = query.all()
    
    results = []
    for doc in doctors:
        data = doc.to_dict()
        # Include hospitals they work at
        hospitals = []
        for aff in doc.hospital_affiliations:
            hospitals.append({
                "id": aff.hospital.id,
                "name": aff.hospital.name,
                "is_primary": aff.is_primary
            })
        data["hospitals"] = hospitals
        results.append(data)
        
    return jsonify({
        "success": True,
        "doctors": results
    }), 200

# ============================================================
# DOCTOR DETAIL
# ============================================================

@doctor_bp.route("/doctors/<int:doctor_id>", methods=["GET"])
@jwt_required()
def get_doctor(doctor_id):
    doc = Doctor.query.get(doctor_id)
    if not doc:
        return jsonify({"success": False, "error": "Doctor not found"}), 404
        
    data = doc.to_dict()
    data["hospitals"] = [
        {
            "id": aff.hospital.id, 
            "name": aff.hospital.name,
            "address": aff.hospital.address,
            "city": aff.hospital.city
        } 
        for aff in doc.hospital_affiliations
    ]
    
    return jsonify({
        "success": True,
        "doctor": data
    }), 200
