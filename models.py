from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime

class Investor(Base):
    __tablename__ = 'investors'

    id = Column(Integer, primary_key=True)
    organisation = Column(String(50))
    website = Column(String(120))
    sector = Column(String(120))
    fund_currency = Column(String(120))
    fund_size_min = Column(Integer)
    fund_size_max = Column(Integer)
    country = Column(String(1000))
    type = Column(String(1000))
    crawl_urls = Column(String(1000))

    def __init__(self, organisation=None, website=None, sector=None, fund_currency=None,
            fund_size_min=None, fund_size_max=None, country=None, type=None, crawl_urls=None):
        self.organisation = organisation
        self.website = website
        self.sector = sector
        self.fund_currency = fund_currency
        self.fund_size_min = fund_size_min
        self.fund_size_max = fund_size_max
        self.country = country
        self.type = type
        self.crawl_urls = crawl_urls

    def __repr__(self):
        return '<Organisation %r>' % (self.organisation)
