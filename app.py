from flask import Flask, request, jsonify, render_template, redirect
import pusher
from database import db_session
from models import Investor
from datetime import datetime
import os
import csv
from io import StringIO

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
        description = request.form["description"]
        competition_available = request.form["competition_available"]

        new_investor = Investor(organisation, website, sector, fund_currency, fund_size_min, fund_size_max, country, type, crawl_urls, description, competition_available)
        new_investor_id = new_investor.id
        db_session.add(new_investor)
        db_session.commit()

        data = {
            "id": new_investor_id,
            "organisation": organisation,
            "website": website,
            "sector": sector,
            "fund_currency": fund_currency,
            "fund_size_min": fund_size_min,
            "fund_size_max": fund_size_max,
            "country" : country,
            "type" : type,
            "crawl_urls" : crawl_urls,
            "description" : description,
            "competition_available" : competition_available}

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
        description = request.form["description"]
        competition_available = request.form["competition_available"]

        update_investor = Investor.query.get(id)
        update_investor.organisation = organisation
        update_investor.website = website
        update_investor.sector = sector
        update_investor.fund_currency = fund_currency
        update_investor.fund_size_min = fund_size_min
        update_investor.fund_size_max = fund_size_max
        update_investor.type = type
        update_investor.crawl_urls = crawl_urls
        update_investor.description = description
        update_investor.competition_available = competition_available

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
            "crawl_urls": crawl_urls,
            "description" : description,
            "competition_available" : competition_available}

        pusher_client.trigger('table', 'update-record', {'data': data })

        return redirect("/", code=302)
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

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload_csv_file', methods=['POST'])
def upload_csv_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        csvf = StringIO(file.read().decode())

        reader = csv.DictReader(csvf, delimiter=',')
        data = [row for row in reader]

        try:
            for row in data:
                organisation = row["Organisation"]
                website = row["Website"]
                sector = row["Sector"]
                fund_currency = row["Fund Currency"]
                fund_size_min = row["Fund Size (Min)"]
                fund_size_max = row["Fund Size (Max)"]
                country = row["Country"]
                type = row["Type"]
                crawl_urls = row["Crawl URLs"]
                description = row["Description"]
                competition_available = row["Competition Available"]

                new_investor = Investor(organisation, website, sector, fund_currency, fund_size_min, fund_size_max, country, type, crawl_urls, description, competition_available)
                new_investor_id = new_investor.id
                db_session.add(new_investor)
                db_session.commit()
        except:
            raise
            return """
                <html>
                <head><title>Wrong format of CSV file</title></head>
                <body>
                Insertion failed because the CSV file is wrongly formatted. The CSV file should contain the following columns:
                  "Organisation",
                  "Website",
                  "Sector",
                  "Fund Currency",
                  "Fund Size (Min)",
                  "Fund Size (Max)",
                  "Country",
                  "Type",
                  "Crawl URLs",
                  "Description",
                  "Competition Available".
                </body>
                </html>
                """

        return redirect("/")

# run Flask app
if __name__ == "__main__":
    app.run()
