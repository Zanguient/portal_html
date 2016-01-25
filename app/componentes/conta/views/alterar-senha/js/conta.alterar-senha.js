/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.1 - 25/09/2015
 *  - Correção: função inexistente no escopo estava sendo invocada
 *
 *  Versão 1.0 - 03/09/2015
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
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
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
        if($scope.newPassword.length < 6){
            $scope.showModalAlerta('Nova senha deve conter no mínimo 6 caracteres!');
            return;     
        }
        atualizaSenha();
    };
    /**
      * Altera efetivamente a senha
      */
    var atualizaSenha = function(){
        $scope.showProgress(divPortletBodyAlteraSenhaPos);
        // JSON
        var jsonAlteraSenha = {userId: -1, senhaAtual: $scope.oldPassword, novaSenha: $scope.newPassword};
        // Update
        $webapi.update($apis.getUrl($apis.administracao.webpagesmembership, undefined,
                       {id: 'token', valor: $scope.token}), jsonAlteraSenha)
            .then(function(dados){
                    $scope.showAlert('Senha alterada com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyAlteraSenhaPos);
                    // Volta para a tela anterior
                    $scope.goMinhaConta();
                    //$scope.goHome();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 500) $scope.showModalAlerta('Senha atual incorreta!');    
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar a senha do usuário (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress(divPortletBodyAlteraSenhaPos);
                  });    
    };
                                            
                                            
}]);