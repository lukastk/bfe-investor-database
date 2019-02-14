from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime

class Investor(Base):
    __tablename__ = 'investors'

    id = Column(Integer, primary_key=True)
    organisation = Column(String(50))
    region = Column(String(120))
    website = Column(String(120))
    description = Column(String(1000))
    additional_info = Column(String(1000))

    def __init__(self, organisation=None, region=None, website=None, description=None, additional_info=None):
        self.organisation = organisation
        self.region = region
        self.website = website
        self.description = description
        self.additional_info = additional_info

    def __repr__(self):
        return '<Organisation %r>' % (self.organisation)
