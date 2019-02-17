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
        website = request.form["website"]
        sector = request.form["sector"]
        fund_currency = request.form["fund_currency"]
        fund_size_min = request.form["fund_size_min"]
        fund_size_max = request.form["fund_size_max"]
        country = request.form["country"]
        type = request.form["type"]
        crawl_urls = request.form["crawl_urls"]

        new_investor = Investor(organisation, website, sector, fund_currency, fund_size_min, fund_size_max, country, type, crawl_urls)
        db_session.add(new_investor)
        db_session.commit()

        data = {
            "id": new_investor.id,
            "organisation": organisation,
            "website": website,
            "sector": sector,
            "fund_currency": fund_currency,
            "fund_size_min": fund_size_min,
            "fund_size_max": fund_size_max,
            "country" : country,
            "type" : type,
            "crawl_urls" : crawl_urls}

        pusher_client.trigger('table', 'new-record', {'data': data })

        return redirect("/add_investor", code=302)
    else:
        investors = Investor.query.all()
        return render_template('add_investor.html', investors=investors)

@app.route('/edit/<int:id>', methods=["POST", "GET"])
def update_record(id):
    if request.method == "POST":
        organisation = request.form["organisation"]
        website = request.form["website"]
        sector = request.form["sector"]
        fund_currency = request.form["fund_currency"]
        fund_size_min = request.form["fund_size_min"]
        fund_size_max = request.form["fund_size_max"]
        type = request.form["type"]
        crawl_urls = request.form["crawl_urls"]

        update_investor = Investor.query.get(id)
        update_investor.organisation = organisation
        update_investor.website = website
        update_investor.sector = sector
        update_investor.fund_currency = fund_currency
        update_investor.fund_size_min = fund_size_min
        update_investor.fund_size_max = fund_size_max
        update_investor.type = type
        update_investor.crawl_urls = crawl_urls

        db_session.commit()

        data = {
            "id": id,
            "organisation": organisation,
            "website": website,
            "sector": sector,
            "fund_currency": fund_currency,
            "fund_size_min": fund_size_min,
            "fund_size_max": fund_size_max,
            "type": type,
            "crawl_urls": crawl_urls}

        pusher_client.trigger('table', 'update-record', {'data': data })

        return redirect("/index", code=302)
    else:
        new_investor = Investor.query.get(id)
        #new_investor.check_in = new_flight.check_in.strftime("%d-%m-%Y %H:%M %p")
        #new_investor.departure = new_flight.departure.strftime("%d-%m-%Y %H:%M %p")
        return render_template('update_investor.html', data=new_investor)

@app.route('/delete/<int:id>', methods = ['POST'])
def delete_entry(id):
    Investor.query.filter_by(id=id).delete()
    db_session.commit()
    return "success"

# run Flask app
if __name__ == "__main__":
    app.run()
