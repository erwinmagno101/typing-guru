import { useSelector, useDispatch} from "react-redux";
import { changeScreen } from "../slices/screenSlice";
import { wpmResult } from "../slices/typeStatsSlice";

const ResultScreen = () => {

    const wpm = useSelector((state) => state.wpm.value)
    const dispatch = useDispatch();
    return(
        <div>
            <p>Results Here</p>
            <p>Your Wpm : {wpm}</p>
            <button onClick={() => {
                dispatch(changeScreen('MainScreen'))
                dispatch(wpmResult(0));
            }}>Restart</button>
        </div>
    )
}

export default ResultScreen;