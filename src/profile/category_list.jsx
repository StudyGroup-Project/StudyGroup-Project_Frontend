import styled from 'styled-components'
import './category_list.css'
import {useState} from 'react'

function CategoryList(props){
    let list = props.list;
    let setUserData = props.setUserData;
    let [open, setOpen] = useState(false);
    let [selected, setSelected] = useState([]);
    let [curValue, setCurValue] = useState(list[0]);

    return(
        <>
            <SelectBox onClick={()=>{
                setOpen(!open)
            }}>
                <Label>{curValue}</Label>
                <SelectOptions show={open}>
                {
                    list.map(function(a, i){
                        return(
                            <Option key={i} onClick={(e)=>{
                                let check = selected.findIndex((item)=>item==list[i])
                                if(check==-1){
                                    let copy = [...selected, list[i]];
                                    setSelected(copy);
                                    setUserData(copy);
                                }
                                setCurValue(list[i]);
                            }}>{list[i]}</Option>
                        )
                    })
                }
                </SelectOptions>
            </SelectBox>

            <span className='change-category-line'></span>

            <div className>
                <Category selected={selected} setSelected={setSelected}
                        setUserData={setUserData}
                />
            </div>
        </>
    )
}

function Category(props){
    let selected = props.selected;
    let setSelected = props.setSelected;
    let setUserData = props.setUserData;

    return(
        <div className='category-card'>
            {  
                selected.map(function(a, i){
                    return(
                        <div key={i} className='categories'>
                            <span>{selected[i]}</span>
                            <span style={{cursor: 'pointer', color:'red'}}
                            onClick={()=>{
                                let copy = [...selected];
                                let arr = copy.filter((item)=>item!=selected[i]);
                                setSelected(arr);
                                setUserData(prev=>({
                                   ...prev,
                                   category : [...arr] 
                                }));
                            }}
                            >❌</span>
                        </div>
                    )
                })
            }
        </div>
    )
}

const SelectBox = styled.div`
    position: relative;
    display:flex;
    align-items:right;
    width: 100%;
    padding: 10px 0px;
    border-radius: 12px;
    height: 40px;
    background-color: #fff;
    align-self: center;
    cursor: pointer;
    &::before {
        content: "⌵";
        position: absolute;
        top: 20%;
        right: 5%;
        color: #000;
        font-size: 20px;
    }
`;
const Label = styled.label`
  font-size: 16px;
`;
const SelectOptions = styled.ul`
  position: absolute;
  list-style: none;
  top: 110%;
  left: 0;
  width: 100%;
  overflow: auto;
  height: 90px;
  max-height: ${(props) => (props.show ? "none" : "0")};
  padding: 0;
  border-radius: 8px;
  background-color: #fff;
  color: #000;
  z-index:1;

  &::-webkit-scrollbar{
    width:8px;
  }

  &::-webkit-scrollbar-thumb {
    height: 20%; /* 스크롤바의 길이 */
    background: #000; /* 스크롤바의 색상 */
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #fff;  /* 스크롤바 뒷 배경 색상 */
  }
`;
const Option = styled.li`
  font-size: 14px;
  padding: 6px 8px;
  transition: background-color 0.2s ease-in;
  border-bottom: 1px solid #E6E6E6;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #E6E6E6;
  }
`;

export { CategoryList, Category };