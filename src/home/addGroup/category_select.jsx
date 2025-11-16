import styled from 'styled-components'
import './category_select.css'
import {useState,useEffect} from 'react'

function CustomSelect(props){
    let list = props.list;
    let setUserData = props.setGroupData;
    let selectedCategories = props.selectedCategories;
    let [open, setOpen] = useState(false);
    let [selected, setSelected] = useState(selectedCategories || []);
    let [curValue, setCurValue] = useState(list[0]);

    useEffect(() => {
        // selectedCategories가 존재하고, 내부 state와 다를 때만 업데이트
        if (selectedCategories) {
            setSelected(selectedCategories);
        }
    }, [selectedCategories]);

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
                                    setUserData(prev=>({
                                        ...prev,
                                        category : [...prev.category, list[i]]
                                    }))
                                }
                                setCurValue(list[i]);
                            }}>{list[i]}</Option>
                        )
                    })
                }
                </SelectOptions>
            </SelectBox>

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
        <div className='addGroup-category-card'>
            {  
                selected.map(function(a, i){
                    return(
                        <div key={i} className='addGroup-categories'>
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
    align-items:center;
    width: 380px;
    padding: 10px 24px;
    border-radius: 15px;
    height: 61px;
    background-color: #E6E6E6;
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
  background-color: #E6E6E6;
  color: #000;
  z-index:1;

  &::-webkit-scrollbar{
    width:8px;
  }

  &::-webkit-scrollbar-thumb {
    height: 30%; /* 스크롤바의 길이 */
    background: #c6c6c6; /* 스크롤바의 색상 */
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #E6E6E6;  /* 스크롤바 뒷 배경 색상 */
  }
`;
const Option = styled.li`
  font-size: 14px;
  padding: 6px 8px;
  transition: background-color 0.2s ease-in;
  &:hover {
    background-color: #595959;
  }
`;

export { CustomSelect, Category };