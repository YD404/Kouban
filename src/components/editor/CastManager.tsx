/**
 * キャスト登録管理コンポーネント
 */
import React from 'react';
import type { CastMaster } from '../../types';
import { DeleteButton, AddButton } from '../ui';

interface CastManagerProps {
    castMaster: CastMaster[];
    onAddCast: () => void;
    onUpdateCast: (id: string, field: keyof CastMaster, value: string) => void;
    onDeleteCast: (id: string) => void;
}

export const CastManager: React.FC<CastManagerProps> = ({
    castMaster,
    onAddCast,
    onUpdateCast,
    onDeleteCast,
}) => {
    return (
        <div className="mt-6 border-t pt-6">
            <h3 className="font-bold mb-4 text-lg">キャスト登録</h3>
            <div className="space-y-4">
                {castMaster.map((cast) => (
                    <div
                        key={cast.id}
                        className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 p-2 rounded"
                    >
                        <input
                            type="text"
                            placeholder="役名"
                            value={cast.role}
                            onChange={(e) => onUpdateCast(cast.id, 'role', e.target.value)}
                            className="border p-3 rounded w-full sm:w-1/3 text-base"
                        />
                        <input
                            type="text"
                            placeholder="キャスト名"
                            value={cast.name}
                            onChange={(e) => onUpdateCast(cast.id, 'name', e.target.value)}
                            className="border p-3 rounded w-full sm:w-1/3 text-base"
                        />
                        <DeleteButton
                            onClick={() => onDeleteCast(cast.id)}
                        />
                    </div>
                ))}
                <AddButton onClick={onAddCast}>
                    + キャストを追加
                </AddButton>
            </div>
        </div>
    );
};

