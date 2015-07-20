/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("conta-alterar-senha", []) 

.controller("conta-alterar-senhaCtrl", ['$scope',
                                        '$state',
                                        '$webapi',
                                        '$apis', 
                                        function($scope,$state,$webapi,$apis){ 
    var divPortletBodyAlteraSenhaPos = 0;   
    $scope.oldPassword = '';
    $scope.newPassword = '';
    $scope.confirmPassword = '';
    
    // Inicialização do controller
    $scope.contaAlterarSenhaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Minha Conta';                          
        $scope.pagina.subtitulo = 'Alterar Senha';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
    };  
    
    
    /**
      * Volta para minha conta
      */
    $scope.cancela = function(){
        $scope.goMinhaConta();    
    };
    /**
      * Salva a senha
      */                                        
    $scope.salvaSenha = function(){
        // Valida a senha
        if($scope.newPassword !== $scope.confirmPassword){
            $scope.showModalAlerta('Nova senha e confirmação não conferem!');
            return;    
        }
        // Verifica senha antiga
        // ...
        $scope.showProgress(divPortletBodyAlteraSenhaPos);
        // Se okay => atualizaSenha();
    };
    /**
      * Altera efetivamente a senha
      */
    var atualizaSenha = function(){
        //$scope.showProgress(divPortletBodyAlteraSenhaPos);
        // JSON
        var jsonAlteraSenha = {UserId: -1, Password: $scope.newPassword};
        // Update
        $webapi.update($apis.getUrl($apis.administracao.webpagesmembership, undefined,
                       {id: 'token', valor: $scope.token}), jsonAlteraSenha)
            .then(function(dados){
                    $scope.showAlert('Senha alterada com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyAlteraSenhaPos);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao alterar a senha do usuário (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress(divPortletBodyAlteraSenhaPos);
                  });    
    };
                                            
                                            
}]);