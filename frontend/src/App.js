import { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [status, setStatus] = useState(null);

  useEffect(()=>{
    try{
      fetch("/api/status")
        .then((response) => {
          return response.json();
        })
        .then((jsondata) => {
          setStatus(jsondata.message);
        });
    }catch(e){
      setStatus(JSON.stringify(e));
    }

  }, []);

  return (
    <div className="App">

      <div style={{display:'flex'}}>
        <div>
          <div>
            status : { JSON.stringify(status) }
          </div>
          <div>
            <form name='form1' method='post' action='/api/html1' target='frame3'>
              <input type='hidden' name='dataname' value="datavalue" />
              <div>
                <textarea name='datajson' cols="50" rows="50">
                {
                  JSON.stringify({
                    'compname': 'your company limited',
                    'doc_title': 'INVOICE',
                    'mycomp': {
                      'compname': 'Good Good Company',
                      'addr1': 'Address Line 1',
                      'addr2': 'Address Line 2',
                      'addr3': 'Address Line 3',
                      'tel': '+852-23456789',
                      'fax': '+852-23459876',
                      'email': 'def@abc.com',
                    },
                    'date': '2022/09/09',
                    'orderno': 'INV-220909001',
                    'orderfor': 'PO-220908001',
                    'contactname': 'Mr Chan',
                    'addr1': 'Cust Address Line 1',
                    'addr2': 'Cust Address Line 2',
                    'tel': '+852-21098765',
                    'fax': '+852-21098777',
                    'email': 'okok@ok.com',
                    'amount': '1,234.00',
                  }, null, 2)
                }
                </textarea>
              </div>
              <div>
                <button onClick="document.form1.submit()">Submit</button>
              </div>
            </form>
          </div>
        </div>
        <div>
          <div>Invoice</div>
          <iframe style={{width:'500px', height:'780px', border:'1px solid lightgray'}} title="3" src='about:blank' name='frame3'></iframe>
        </div>
      </div>
    </div>
  );
}

export default App;
