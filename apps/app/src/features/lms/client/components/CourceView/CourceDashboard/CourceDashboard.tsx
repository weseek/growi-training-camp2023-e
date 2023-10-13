import { useEffect, useState } from 'react';

import { TinyLine, Liquid, Column } from '@ant-design/plots';

const DemoTinyLine = () => {
  const data: number[] = [];
  for (let i = 0; i < 10; i++) {
    data.push(Math.random() * 1000);
  }
  const config = {
    height: 60,
    autoFit: false,
    data,
    smooth: true,
  };
  return <TinyLine {...config} />;
};

const DemoLiquid = () => {
  const config = {
    percent: 0.25,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: {
      length: 128,
    },
  };
  return <Liquid {...config} />;
};

const DemoColumn = () => {
  const [data, setData] = useState([]);

  const asyncFetch = () => {
    fetch('https://gw.alipayobjects.com/os/antfincdn/8elHX%26irfq/stack-column-data.json')
      .then(response => response.json())
      .then(json => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    data,
    isStack: true,
    xField: 'year',
    yField: 'value',
    seriesField: 'type',
  };

  useEffect(() => {
    asyncFetch();
  }, []);

  return <Column {...config} />;
};

export const CourceDashboard = (): JSX.Element => {
  return (
    <>
      <div className="row">
        <div className="col-4">
          <div className="card mb-3">
            <div className="row no-gutters">
              <div className="col-md-4 d-flex flex-column align-items-center justify-content-center bg-light">
                <div><b>Active user / week</b></div>
                <div className="display-3">26</div>
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">Card title</h5>
                  <p className="card-text"><DemoTinyLine /></p>
                  <p className="card-text text-right"><small className="text-muted">Last updated 3 mins ago</small></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card mb-3">
            <div className="row no-gutters">
              <div className="col-md-4 d-flex flex-column align-items-center justify-content-center bg-light">
                <div><b>Active user / month</b></div>
                <div className="display-3">500</div>
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">Card title</h5>
                  <p className="card-text"><DemoTinyLine /></p>
                  <p className="card-text text-right"><small className="text-muted">Last updated 3 mins ago</small></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card mb-3">
            <div className="row no-gutters">
              <div className="col-md-4 d-flex flex-column align-items-center justify-content-center bg-light">
                <div><b>Active organizations</b></div>
                <div className="display-3">1349</div>
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">Card title</h5>
                  <p className="card-text"><DemoTinyLine /></p>
                  <p className="card-text text-right"><small className="text-muted">Last updated 3 mins ago</small></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Completed users</h5>
              <p className="d-flex justify-content-center" style={{ minHeight: '300px' }}><DemoLiquid /></p>
              <p className="card-text text-right"><small className="text-muted">Last updated 3 mins ago</small></p>
            </div>
          </div>
        </div>
        <div className="col-8">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Completed users</h5>
              <p className="d-flex justify-content-center" style={{ minHeight: '300px' }}><DemoColumn /></p>
              <p className="card-text text-right"><small className="text-muted">Last updated 3 mins ago</small></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
