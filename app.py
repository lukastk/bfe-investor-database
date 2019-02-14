from flask import Flask, request, jsonify, render_template, redirect
import pusher
from database import db_session
from models import Investor
from datetime import datetime
import os

app = Flask(__name__)

pusher_client = pusher.Pusher(
    app_id=os.getenv('PUSHER_APP_ID'),
    key=os.getenv('PUSHER_KEY'),
    secret=os.getenv('PUSHER_SECRET'),
    cluster=os.getenv('PUSHER_CLUSTER'),
    ssl=True)

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route('/')
@app.route('/index.html')
@app.route('/index.htm')
def index():
    investors = Investor.query.all()
    return render_template('index.html', investors=investors)

@app.route('/add_investor', methods=["POST", "GET"])
def add_investor():
    if request.method == "POST":
        organisation = request.form["organisation"]
        region = request.form["region"]
        website = request.form["website"]
        description = request.form["description"]
        additional_info = request.form["additional_info"]

        new_investor = Investor(organisation, region, website, description, additional_info)
        db_session.add(new_investor)
        db_session.commit()

        data = {
            "id": new_investor.id,
            "organisation": organisation,
            "region": region,
            "website": website,
            "description": description,
            "additional_info": additional_info}

        pusher_client.trigger('table', 'new-record', {'data': data })

        return redirect("/add_investor", code=302)
    else:
        investors = Investor.query.all()
        return render_template('add_investor.html', investors=investors)

@app.route('/edit/<int:id>', methods=["POST", "GET"])
def update_record(id):
    if request.method == "POST":
        organisation = request.form["organisation"]
        region = request.form["region"]
        website = request.form["website"]
        description = request.form["description"]
        additional_info = request.form["additional_info"]

        update_investor = Investor.query.get(id)
        update_investor.organisation = organisation
        update_investor.region = region
        update_investor.website = website
        update_investor.description = description
        update_investor.additional_info = additional_info

        db_session.commit()

        data = {
            "id": id,
            "organisation": organisation,
            "region": region,
            "website": website,
            "description": description,
            "additional_info": additional_info}

        pusher_client.trigger('table', 'update-record', {'data': data })

        return redirect("/index", code=302)
    else:
        new_investor = Investor.query.get(id)
        #new_investor.check_in = new_flight.check_in.strftime("%d-%m-%Y %H:%M %p")
        #new_investor.departure = new_flight.departure.strftime("%d-%m-%Y %H:%M %p")
        return render_template('update_investor.html', data=new_investor)


# run Flask app
if __name__ == "__main__":
    app.run()
