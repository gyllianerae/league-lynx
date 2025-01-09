import { Routes, Route } from "react-router-dom";
import { PlayersPage } from "@/components/players/PlayersPage";
import { MyPlayersPage } from "@/components/players/MyPlayersPage";
import { PlayerUpdatesPage } from "@/components/players/PlayerUpdatesPage";
import { PlayerProfile } from "@/components/players/PlayerProfile";

export default function Players() {
  return (
    <Routes>
      <Route index element={<PlayersPage />} />
      <Route path="my-players" element={<MyPlayersPage />} />
      <Route path="updates" element={<PlayerUpdatesPage />} />
      <Route path="profile/:playerId" element={<PlayerProfile />} />
    </Routes>
  );
}